const fs = require('fs');
const path = require('path');

Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false,
});

function camelize(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function generateRepo(name) {
    console.log(`Creating repository ${name}...`);
    const repositoryPath = path.join(__dirname, `../src/database/typeorm/repositories`);
    const repositoryFilePath = path.join(repositoryPath, `${name}.repository.ts`);
    const nameCapitalized = name.capitalize();

    const repositoryTemplate = `/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ${nameCapitalized}Entity } from '~/database/typeorm/entities/${name}.entity';

@Injectable()
export class ${nameCapitalized}Repository extends Repository<${nameCapitalized}Entity> {
    constructor(private dataSource: DataSource) {
        super(${nameCapitalized}Entity, dataSource.createEntityManager());
    }
}
`;

    if (!fs.existsSync(repositoryPath)) {
        fs.mkdirSync(repositoryPath, { recursive: true });
    }

    fs.writeFileSync(repositoryFilePath, repositoryTemplate);
}

function importToModule(name) {
    console.log(`Importing repository to module...`);
    const nameCapitalized = name.capitalize();
    const modulePath = path.join(__dirname, `../src/database/typeorm/database.module.ts`);
    const moduleContent = fs.readFileSync(modulePath, 'utf8');
    // find const entities array in moduleContent
    const entities = moduleContent
        .match(/const entities = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim());
    if (entities instanceof Array) entities.push(`${nameCapitalized}Entity`);

    // find all imports in moduleContent
    const imports = moduleContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${nameCapitalized}Entity } from '~/database/typeorm/entities/${name}.entity';`);
    console.log('LOG:: imports:', imports);

    let newModuleContent = moduleContent;
    // delete all imports from moduleContent and remove empty lines
    newModuleContent = newModuleContent.replace(/import \{.*?\} from .*/g, '');
    newModuleContent = newModuleContent.replace(/^\s*[\r\n]const entities/gm, 'const entities');

    // add new imports to first line
    newModuleContent = `${imports.join('\n')}\r\n\r\n${newModuleContent}`;

    // write entities to moduleContent
    newModuleContent = newModuleContent.replace(/const entities = \[(.*?)\]/s, `const entities = [\n    ${entities.join(',\n    ')}\n]`);

    console.log('LOG:: newModuleContent:', newModuleContent);

    // write moduleContent to modulePath
    fs.writeFileSync(modulePath, newModuleContent);
}

function generateEntity(tableName, entityName) {
    console.log(`Creating entity ${entityName}...`);
    const entityPath = path.join(__dirname, `../src/database/typeorm/entities`);
    const entityFilePath = path.join(entityPath, `${entityName}.entity.ts`);
    const nameCapitalized = entityName.capitalize();

    const entityTemplate = `import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({ name: '${tableName}' })
export class ${nameCapitalized}Entity extends AbstractEntity {
    @PrimaryGeneratedColumn('increment', { name: 'id', type: 'int', unsigned: true })
    id: number;
}
`;

    if (!fs.existsSync(entityPath)) {
        fs.mkdirSync(entityPath, { recursive: true });
    }

    fs.writeFileSync(entityFilePath, entityTemplate);
}

function generateCommand(moduleName, commandName) {
    console.info(`Creating command ${commandName}...`);
    const commandHandlerPath = path.join(__dirname, `../src/modules/${moduleName}/commands/handlers`);
    const commandImplPath = path.join(__dirname, `../src/modules/${moduleName}/commands/impl`);

    if (!fs.existsSync(commandHandlerPath)) {
        fs.mkdirSync(commandHandlerPath, { recursive: true });
    }

    if (!fs.existsSync(commandImplPath)) {
        fs.mkdirSync(commandImplPath, { recursive: true });
    }

    const commandHandlerCapitalized = `${camelize(commandName)}Handler`.capitalize();
    const commandHandlerFilePath = path.join(commandHandlerPath, `${commandName}.handler.ts`);

    const commandImplCapitalized = `${camelize(commandName)}Command`.capitalize();
    const commandImplFilePath = path.join(commandImplPath, `${commandName}.command.ts`);

    // load template from file
    const commandHandlerTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/command.handler.template`), 'utf8');
    const commandImplTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/impl.template`), 'utf8');

    // replace placeholders
    const commandHandlerTemplateReplaced = commandHandlerTemplate
        .replace(/{{commandName}}/g, commandName)
        .replace(/{{commandImplCapitalized}}/g, commandImplCapitalized)
        .replace(/{{commandHandlerCapitalized}}/g, commandHandlerCapitalized);

    const commandImplTemplateReplaced = commandImplTemplate.replace(/{{implNameCapitalized}}/g, commandImplCapitalized);

    // write files
    fs.writeFileSync(commandHandlerFilePath, commandHandlerTemplateReplaced);
    fs.writeFileSync(commandImplFilePath, commandImplTemplateReplaced);

    // import to index.ts in commands/handlers folder
    importToCommandHandlerIndex(commandHandlerPath, commandHandlerCapitalized, commandName);
}

function importToCommandHandlerIndex(commandHandlerPath, commandHandlerCapitalized, commandName) {
    const commandHandlerIndexFilePath = path.join(commandHandlerPath, `index.ts`);
    if (!fs.existsSync(commandHandlerIndexFilePath)) {
        fs.writeFileSync(commandHandlerIndexFilePath, '');
    }

    const handlerIndexContent = fs.readFileSync(commandHandlerIndexFilePath, 'utf8');
    const handlers = handlerIndexContent
        .match(/export const CommandHandlers = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim());
    if (handlers instanceof Array) handlers.push(`${commandHandlerCapitalized}`);

    // find all imports in handlerIndexContent
    const imports = handlerIndexContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${commandHandlerCapitalized} } from './${commandName}.handler';`);

    let newHandlerIndexContent = handlerIndexContent;

    // delete all imports from moduleContent and remove empty lines
    newHandlerIndexContent = newHandlerIndexContent.replace(/import \{.*?\} from .*/g, '');
    newHandlerIndexContent = newHandlerIndexContent.replace(/^\s*[\r\n]export const CommandHandlers/gm, 'export const CommandHandlers');

    // add new imports to first line
    newHandlerIndexContent = `${imports.join('\n')}\r\n\r\n${newHandlerIndexContent}`;

    // write entities to moduleContent
    newHandlerIndexContent = newHandlerIndexContent.replace(
        /export const CommandHandlers = \[(.*?)\]/s,
        `export const CommandHandlers = [\n    ${handlers.join(',\n    ')}\n]`,
    );

    // write moduleContent to modulePath
    fs.writeFileSync(commandHandlerIndexFilePath, newHandlerIndexContent);
}

function generateQuery(moduleName, queryName) {
    console.info(`Creating query ${queryName}...`);
    const queryHandlerPath = path.join(__dirname, `../src/modules/${moduleName}/queries/handlers`);
    const queryImplPath = path.join(__dirname, `../src/modules/${moduleName}/queries/impl`);

    if (!fs.existsSync(queryHandlerPath)) {
        fs.mkdirSync(queryHandlerPath, { recursive: true });
    }

    if (!fs.existsSync(queryImplPath)) {
        fs.mkdirSync(queryImplPath, { recursive: true });
    }

    const queryHandlerCapitalized = `${camelize(queryName)}Handler`.capitalize();
    const queryHandlerFilePath = path.join(queryHandlerPath, `${queryName}.handler.ts`);

    const queryImplCapitalized = `${camelize(queryName)}Query`.capitalize();
    const queryImplFilePath = path.join(queryImplPath, `${queryName}.query.ts`);

    // load template from file
    const queryHandlerTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/query.handler.template`), 'utf8');
    const queryImplTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/impl.template`), 'utf8');

    // replace placeholders
    const queryHandlerTemplateReplaced = queryHandlerTemplate
        .replace(/{{queryName}}/g, queryName)
        .replace(/{{queryImplCapitalized}}/g, queryImplCapitalized)
        .replace(/{{queryHandlerCapitalized}}/g, queryHandlerCapitalized);

    const queryImplTemplateReplaced = queryImplTemplate.replace(/{{implNameCapitalized}}/g, queryImplCapitalized);

    // write files
    fs.writeFileSync(queryHandlerFilePath, queryHandlerTemplateReplaced);
    fs.writeFileSync(queryImplFilePath, queryImplTemplateReplaced);

    // import to index.ts in queries/handlers folder
    importToQueryHandlerIndex(queryHandlerPath, queryHandlerCapitalized, queryName);
}

function importToQueryHandlerIndex(queryHandlerPath, queryHandlerCapitalized, queryName) {
    const queryHandlerIndexFilePath = path.join(queryHandlerPath, `index.ts`);
    if (!fs.existsSync(queryHandlerIndexFilePath)) {
        fs.writeFileSync(queryHandlerIndexFilePath, '');
    }

    const handlerIndexContent = fs.readFileSync(queryHandlerIndexFilePath, 'utf8');
    const handlers = handlerIndexContent
        .match(/export const QueryHandlers = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim());
    if (handlers instanceof Array) handlers.push(`${queryHandlerCapitalized}`);

    // find all imports in handlerIndexContent
    const imports = handlerIndexContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${queryHandlerCapitalized} } from './${queryName}.handler';`);

    let newHandlerIndexContent = handlerIndexContent;

    // delete all imports from moduleContent and remove empty lines
    newHandlerIndexContent = newHandlerIndexContent.replace(/import \{.*?\} from .*/g, '');
    newHandlerIndexContent = newHandlerIndexContent.replace(/^\s*[\r\n]export const QueryHandlers/gm, 'export const QueryHandlers');

    // add new imports to first line
    newHandlerIndexContent = `${imports.join('\n')}\r\n\r\n${newHandlerIndexContent}`;

    // write entities to moduleContent
    newHandlerIndexContent = newHandlerIndexContent.replace(
        /export const QueryHandlers = \[(.*?)\]/s,
        `export const QueryHandlers = [\n    ${handlers.join(',\n    ')}\n]`,
    );

    // write moduleContent to modulePath
    fs.writeFileSync(queryHandlerIndexFilePath, newHandlerIndexContent);
}

function generateEvent(moduleName, eventName) {
    console.info(`Creating event ${eventName}...`);
    const eventHandlerPath = path.join(__dirname, `../src/modules/${moduleName}/events/handlers`);
    const eventImplPath = path.join(__dirname, `../src/modules/${moduleName}/events/impl`);

    if (!fs.existsSync(eventHandlerPath)) {
        fs.mkdirSync(eventHandlerPath, { recursive: true });
    }

    if (!fs.existsSync(eventImplPath)) {
        fs.mkdirSync(eventImplPath, { recursive: true });
    }

    const eventHandlerCapitalized = `${camelize(eventName)}Handler`.capitalize();
    const eventHandlerFilePath = path.join(eventHandlerPath, `${eventName}.handler.ts`);

    const eventImplCapitalized = `${camelize(eventName)}Event`.capitalize();
    const eventImplFilePath = path.join(eventImplPath, `${eventName}.event.ts`);

    // load template from file
    const eventHandlerTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/event.handler.template`), 'utf8');
    const eventImplTemplate = fs.readFileSync(path.join(__dirname, `../scripts/templates/impl.template`), 'utf8');

    // replace placeholders
    const eventHandlerTemplateReplaced = eventHandlerTemplate
        .replace(/{{eventName}}/g, eventName)
        .replace(/{{eventImplCapitalized}}/g, eventImplCapitalized)
        .replace(/{{eventHandlerCapitalized}}/g, eventHandlerCapitalized);

    const eventImplTemplateReplaced = eventImplTemplate.replace(/{{implNameCapitalized}}/g, eventImplCapitalized);

    // write files
    fs.writeFileSync(eventHandlerFilePath, eventHandlerTemplateReplaced);
    fs.writeFileSync(eventImplFilePath, eventImplTemplateReplaced);

    // import to index.ts in events/handlers folder
    importToEventHandlerIndex(eventHandlerPath, eventHandlerCapitalized, eventName);
}

function importToEventHandlerIndex(eventHandlerPath, eventHandlerCapitalized, eventName) {
    const eventHandlerIndexFilePath = path.join(eventHandlerPath, `index.ts`);
    if (!fs.existsSync(eventHandlerIndexFilePath)) {
        fs.writeFileSync(eventHandlerIndexFilePath, '');
    }

    const handlerIndexContent = fs.readFileSync(eventHandlerIndexFilePath, 'utf8');
    const handlers = handlerIndexContent
        .match(/export const EventHandlers = \[(.*?)\]/s)[1]
        .split(',')
        .map((e) => e.trim());
    if (handlers instanceof Array) handlers.push(`${eventHandlerCapitalized}`);

    // find all imports in handlerIndexContent
    const imports = handlerIndexContent.match(/import \{.*?\} from .*/g);
    if (imports instanceof Array) imports.push(`import { ${eventHandlerCapitalized} } from './${eventName}.handler';`);

    let newHandlerIndexContent = handlerIndexContent;

    // delete all imports from moduleContent and remove empty lines
    newHandlerIndexContent = newHandlerIndexContent.replace(/import \{.*?\} from .*/g, '');
    newHandlerIndexContent = newHandlerIndexContent.replace(/^\s*[\r\n]export const EventHandlers/gm, 'export const EventHandlers');

    // add new imports to first line
    newHandlerIndexContent = `${imports.join('\n')}\r\n\r\n${newHandlerIndexContent}`;

    // write entities to moduleContent
    newHandlerIndexContent = newHandlerIndexContent.replace(
        /export const EventHandlers = \[(.*?)\]/s,
        `export const EventHandlers = [\n    ${handlers.join(',\n    ')}\n]`,
    );

    // write moduleContent to modulePath
    fs.writeFileSync(eventHandlerIndexFilePath, newHandlerIndexContent);
}

module.exports = {
    camelize,
    generateRepo,
    importToModule,
    generateEntity,
    generateCommand,
    generateQuery,
    generateEvent,
};
