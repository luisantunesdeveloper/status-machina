# status-machina

> a device that can be in one of a set number of stable conditions depending on its previous condition and on the present values of its inputs

The complete documentation can be found [here](https://status-machina.gitbook.io/project/)

## State machines types

Although the citation, for now status-machina has the following machines and features implemented. If appropriate an example will be given.

### Moore machines

- [x] States and transitions
- [x] States produces output

[Moore example](https://github.com/luisantunesdeveloper/status-machina/blob/master/examples/moore/index.js)
[Todo example](https://github.com/luisantunesdeveloper/status-machina/blob/master/examples/todo/src)

### Mealy machines

- [x] States and transitions
- [x] Transitions produces output depending on the input

### Other features

- [x] Broadcast communication (events)
- [x] Actions (Before, After)

## Install

```sh
npm i status-machina
```

## Development

Open a pull request when you're ready.  
Don't forget to add your tests.

```sh
git clone https://github.com/luisantunesdeveloper/status-machina.git
cd status-machina && npm i
```

### Tests

```sh
npm test
```

```sh
npm run test:watch
```

### Examples

Go to examples directory.

## License

MIT © Luís Antunes
