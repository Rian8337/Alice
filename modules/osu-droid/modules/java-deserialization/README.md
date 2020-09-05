# Java Deserialization for Node

[![npm version](https://img.shields.io/npm/v/java-deserialization.svg)](https://www.npmjs.com/package/java-deserialization)
[![build status](https://travis-ci.org/gagern/nodeJavaDeserialization.svg?branch=master)](https://travis-ci.org/gagern/nodeJavaDeserialization)
[![coverage status](https://coveralls.io/repos/github/gagern/nodeJavaDeserialization/badge.svg?branch=master)](https://coveralls.io/github/gagern/nodeJavaDeserialization?branch=master)

This package started out with the hope of satisfying
some specific need for a given project.
The first version was committed once that need was satisfied.
So far, it makes no claims of completeness or correctness.
But if you need to deserialize some Java objects using JavaScript,
then you might prefer building on that over starting from scratch.

## Usage

```js
var javaDeserialization = require("java-deserialization");
var objects = javaDeserialization.parse(buf);
```

Each object in `objects` will contain the values of its “normal”
fields as properties, and two hidden properties.
One is called `class` and represents the class of the object,
with `super` pointing at its parent class.
The other is `extends` which is a map from fully qualified class names
to the fields associated with that class.
If one wants to inspect the private field of some specific class,
using `extends` will help in cases where a more derived class contains
another field of the same name.
The names `class` and `extends` were deliberately chosen in such a way
that they are keywords in Java and won't occur in normal field names.
The properties are non-enumerable, so they won't show up in enumerations
and e.g. `util.inspect` won't show them by default.

## Custom deserialization code

If the class contained custom serialization code,
the output from that is collected in a special property called `@`.
One can write post-processing code to reformat the data from that list.
Such code has already been added for the following types:

* **`java.util.ArrayList`** – extracts a `list` field which is an ES Array
* **`java.util.ArrayDeque`** – extracts a `list` field
* **`java.util.Hashtable`** – extracts a `map` field which is an ES6 Map
  and an `obj` for `String`-valued keys
* **`java.util.HashMap`** – `map` and `obj` just as `Hashtable`
* **`java.util.EnumMap`** – `map` and `obj`, the latter with enum
  constant names as keys
* **`java.util.HashSet`** – extracts a `set` field which is an ES6 Set

## Contributing

Bug reports, suggestions, code contributions and the likes should go
to the project's GitHub page.
