<!--BEGIN HEADER-->
<div id="top" align="center">
  <img align="center" src="assets/logo.png" width="80" height="80" />
  <h1>sun-db</h1>
  <a href="https://npmjs.com/package/sun-db">
    <img alt="NPM" src="https://img.shields.io/npm/v/sun-db.svg">
  </a>
  <a href="https://github.com/sun-db/sun-db">
    <img alt="TypeScript" src="https://img.shields.io/github/languages/top/sun-db/sun-db.svg">
  </a>
</div>

<br />

<blockquote align="center">The database for your first 100 users.</blockquote>

<br />

_If I should maintain this repo, please ⭐️_
<a href="https://github.com/sun-db/sun-db">
  <img align="right" alt="GitHub stars" src="https://img.shields.io/github/stars/sun-db/sun-db?label=%E2%AD%90%EF%B8%8F&style=social">
</a>

_DM me on [Twitter](https://twitter.com/bconnorwhite) if you have questions or suggestions._
<a href="https://twitter.com/bconnorwhite">
  <img align="right" alt="Twitter" src="https://img.shields.io/twitter/url?label=%40bconnorwhite&style=social&url=https%3A%2F%2Ftwitter.com%2Fbconnorwhite">
</a>

---
<!--END HEADER-->

## Introduction

With SunDB, your datamodel is a [Zod](https://github.com/colinhacks/zod#readme) schema, and your database is a JSON file.

### Why is this interesting?

Simplicity, flexibility, and development speed:

**☀️ Easy**  
NPM install your database with zero configuration, and run locally.

**⚡️ Fast**  
Create your datamodel in seconds with Zod.

**✨ Simple**  
Your data is easy to inspect in a JSON file.

**🧘‍♀️ Flexible**  
Migrations are JavaScript functions.

When starting a new project, you don't always know what your data will end up looking like.

Instead of wasting time building out a database with a complex datamodel, SunDB makes it easy to get started and iterate until you are ready to make that investment.

## Contents

- [Installation](#installation)
- [Setup](#setup)
- [Tables](#tables)
  - [Record Tables](#record-tables)
    - [has](#has)
    - [get](#get)
    - [add](#add)
    - [set](#set)
    - [replace](#replace)
    - [remove](#remove)
    - [clear](#clear)
  - [Array Tables](#array-tables)
    - [exists](#exists)
    - [select](#select)
    - [selectFirst](#select-first)
    - [insert](#insert)
    - [insertAll](#insertall)
    - [update](#update)
    - [updateFirst](#update-first)
    - [upsert](#upsert)
    - [upsertFirst](#upsert-first)
    - [delete](#delete)
    - [deleteFirst](#delete-first)
    - [truncate](#truncate)
  - [Shared Table Methods](#shared-table-methods)
    - [name](#name)
    - [rename](#rename)
    - [drop](#drop)
  - [Table Methods Summary](#table-methods-summary)
- [Queries](#queries)
  - [Order By](#order-by)
  - [Where](#where)
    - [Equality Operators](#equality-operators)
    - [Comparison Operators](#comparison-operators)
    - [Magnitude Operators](#magnitude-operators)
    - [Text Operators](#text-operators)
    - [Array Operators](#array-operators)
  - [Offset](#offset)
  - [Limit](#limit)
- [Database](#database)
  - [path](#path)
  - [move](#move)
  - [schema](#schema)
  - [tables](#tables)
  - [read](#read)
  - [write](#write)
  - [drop](#drop)
  - [erase](#erase)
  - [version](#version)
  - [migrate](#migrate)

## Installation

<a href="https://www.npmjs.com/package/sun-db">
  <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white" alt="NPM" />
</a>

```sh
npm install sun-db
```

<a href="https://yarnpkg.com/package/sun-db">
  <img src="https://img.shields.io/badge/yarn-2C8EBB?logo=yarn&logoColor=white" alt="Yarn" />
</a>

```sh
yarn add sun-db
```
<span>
  <img src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=white" alt="PNPM" />
</span>

```sh
pnpm add sun-db
```

## Basic Usage

```ts
import { SunDB } from "sun-db";
import z from "zod";

const schema = {
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  )
};

const { client } = new SunDB("db.json", schema);

// Inserting a user
client.users.insert({ id: "1", name: "Bob" });

// Selecting a user
const user = client.users.select({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

## Tables

A SunDB is a JSON object, where each field is a table.

SunDB supports two types of tables: array tables and record tables. Record tables are indexed by a key, while array tables are not.

The structure of tables are represented by Zod schemas. The provided schema is used to validate data when reading and writing to ensure end-to-end type safety.

In this example, we have two tables: `users` and `posts`:

```ts
import { SunDB } from "sun-db";
import z from "zod";

const schema = {
  // An array table:
  users: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  // A record table:
  posts: z.record(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      authorID: z.string()
    })
  )
};

const db = new SunDB("db.json", schema);
```

### Record Tables

#### Has
The `has` method allows you to check if a record exists in record tables at a specific key.

If the key exists, it will return `true`. Otherwise, it will return `false`.
```ts
const hasPost = client.has("1");
```

#### Get
The get method allows you to get a value at a specific key.

If the key exists, the value will be returned. Otherwise, it will return `undefined`.
```ts
const post = client.get("1");
```

#### Add
The `add` method allows you to add a new record to the table.

If the add is successful, the added value will be returned. Otherwise, if the key already exists, it will return `undefined`.
```ts
const post = client.add("1", {
  id: "1",
  title: "Hello World",
  content: "This is my first post"
});
```

#### Set
The set method allows you to set a value at a specific key.

It returns the value that was set.
```ts
const post = client.set("1", {
  id: "1",
  title: "Hello World",
  content: "This is my first post"
});
```

#### Replace
The replace method operates like an upsert - it allows you to replace a value at a specific key, if that key exists.

If the replace is successful, the replaced value will be returned. Otherwise, if the key does not already exist, it will return `undefined`.
```ts
const post = client.replace("1", {
  id: "1",
  title: "Hello World",
  content: "This is my edited post"
});
```

#### Remove
The remove method removes a record at a specific key.

If the remove is successful, the removed value will be returned. Otherwise, if the key does not already exist, it will return `undefined`.
```ts
const removedPost = client.remove("1");
```

#### Clear
The clear method removes all records from a table.

```ts
client.clear();
```

### Array Tables

#### Exists
The exists method allows you to check if a record exists in array tables.

If the record exists, it will return `true`. Otherwise, it will return `false`.
```ts
const hasPost = client.exists({
  where: {
    id: {
      eq: "1"
    }
  }
});
```

#### Select

The select method allows you to select all records from an array table that match a query.

```ts
const users = client.users.select({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

#### SelectFirst

The selectFirst method allows you to select the first record from an array table that matches a query.

```ts
const user = client.users.selectFirst({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

#### Insert

The insert method allows you to insert a new record into the table.

```ts
const user = client.users.insert({ id: "1", name: "Bob" });
```

#### InsertAll

The insertAll method allows you to insert multiple records into the table.

```ts
const users = client.users.insertAll([
  { id: "1", name: "Bob" },
  { id: "2", name: "Alice" },
]);
```

#### Upsert

The upsert method updates all records that match a query. If no records match the query, a new record is inserted.

```ts
const users = client.users.upsert({
  where: {
    name: {
      eq: "Bob"
    }
  },
  data: {
    id: "1",
    name: "Bob"
  }
});
```

#### UpsertFirst

The upsertFirst method updates the first record that matches a query. If no records match the query, a new record is inserted.

```ts
const user = client.users.upsertFirst({
  where: {
    name: {
      eq: "Bob"
    }
  },
  data: {
    name: "Alice"
  }
});
```

#### Update

The update method updates all records that match a query.

```ts
const users = client.users.update({
  where: {
    name: {
      eq: "Bob"
    }
  },
  data: {
    name: "Alice"
  }
});
```

#### UpdateFirst

The updateFirst method updates the first record that matches a query.

```ts
const user = client.users.updateFirst({
  where: {
    name: {
      eq: "Bob"
    }
  },
  data: {
    name: "Alice"
  }
});
```

#### Delete

The delete method removes all records that match a query.

```ts
const users = client.users.delete({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

#### DeleteFirst

The deleteFirst method removes the first record that matches a query.

```ts
const user = client.users.deleteFirst({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

#### Truncate

Truncate removes all records from an array table.

```ts
client.users.truncate();
```

### Shared Table Methods

#### Name

The name field returns the name of the table.

```ts
const name = client.users.name; // "users"
```

#### Rename

Rename changes the name of the table.

```ts
client.users.rename("people");
```

#### Drop

Drop removes a table from the database.

```ts
client.users.drop();
```

### Table Methods Summary

| Record Tables | Array Tables            |
| ------------- | ----------------------- |
| `has`         | `exists`                |
| `get`         | `select`, `selectFirst` |
| `add`         | `insert`, `insertAll`   |
| `set`         | `update`, `updateFirst` |
| `replace`     | `upsert`, `upsertFirst` |
| `remove`      | `delete`, `deleteFirst` |
| `clear`       | `truncate`              |
| `rename`      | `rename`                |
| `drop`        | `drop`                  |

## Queries

Queries are used to filter records in array tables.

### Where

The where field allows you to filter records.

#### Equality Operators

Equality operators apply for `boolean`, `number`, and `string` types.

| Operator | Description  |
| -------- | ------------ |
| `eq`     | Equal to     |
| `neq`    | Not equal to |

Example:
```ts
client.users.select({
  where: {
    name: {
      eq: "Bob"
    }
  }
});
```

#### Magnitude Operators

Magnitude operators apply for `number` and `string` types.

| Operator | Description  |
| -------- | ------------ |
| `gt`     | Greater than |
| `gte`    | Greater than or equal to |
| `lt`     | Less than |
| `lte`    | Less than or equal to |

Example:
```ts
client.users.select({
  where: {
    id: {
      gt: "1"
    }
  }
});
```

#### List Operators

List operators apply for `boolean`, `number`, and `string` types.

| Operator | Description  |
| -------- | ------------ |
| `in`     | In list      |
| `nin`    | Not in list  |

Example:
```ts
client.users.select({
  where: {
    name: {
      in: ["Bob", "Alice"]
    }
  }
});
```

#### Text Operators

Text operators apply for `string` types.

| Operator | Description  |
| -------- | ------------ |
| includes | Includes     |
| nincludes | Does not include |
| startsWith | Starts with |
| nstartsWith | Does not start with |
| endsWith | Ends with |
| nendsWith | Does not end with |
| regex | Matches regex |
| nregex | Does not match regex |

Example:
```ts
client.users.select({
  where: {
    name: {
      regex: /^.o.$/
    }
  }
});
```

#### Array Operators

Array operators apply for `array` types.

| Operator | Description  |
| -------- | ------------ |
| `contains` | Contains |
| `ncontains` | Does not contain |

Example:
```ts
client.users.select({
  where: {
    tags: {
      contains: "admin"
    }
  }
});
```

### Offset

The offset field allows you to skip a number of records.

```ts
client.users.select({
  offset: 10
});
```

### Limit

The limit field allows you to limit the number of records returned.

```ts
client.users.select({
  limit: 10
});
```

## Database

### Path

Get the path to the database file.

```ts
const path = db.path();
```

### Move

Move the database file to a new location.

```ts
await db.move("new/path/to/db.json");
```

### Tables

Returns an array of all table names.

```ts
const tables = db.tables();
```

### Read

Read the database file.

```ts
const data = await db.read();
```

### Write

Write the database file

```ts
await db.write(data);
```

### Drop

Drop all database tables, without removing the file.

```ts
await db.drop();
```

### Erase

Completely remove the database file.

```ts
await db.erase();
```

### Version

Get the current version of the database.

```ts
const version = await db.version();
```

### Migrate

Migrate the database to a new version. All migrations higher than the current database version are run in order, until the target version is reached.

In this case, only the second migration will be run:

```ts
const version = await db.version(); // 1

await db.migrate(2, {
  1: (db) => {
    db.client.users.rename("people");
  },
  2: (db) => {
    db.client.posts.rename("articles");
  }
});
```

<!--BEGIN FOOTER-->

<h2 id="license">License <a href="https://opensource.org/licenses/MIT"><img align="right" alt="license" src="https://img.shields.io/npm/l/sun-db.svg"></a></h2>

[MIT](https://opensource.org/licenses/MIT) - _MIT License_
<!--END FOOTER-->
