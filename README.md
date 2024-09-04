# 🏷️ ntag21x

> A simple TypeScript/JavaScript library to build commands and parse responses for NTAG21x NFC tags.

## ✨ Features

- 🛠️ `build`: Build commands based on datasheets.
- 📖 `parse`: Parse and validate responses based on datasheets.

### Provided in each command class

- `timeoutMs`: Specifies the timeout in milliseconds for waiting for the command response.
- `build(...args: BuildArgs): Uint8Array`: Constructs the command as a Uint8Array. Accepts arguments required for the specific command.
- `parse(response: Uint8Array): { parsed: ParsedResult, raw: Uint8Array }`: Parses the NFC tag response and returns both the structured parsed result and the original raw data as Uint8Array.

## 🚀 Installation

```bash
npm i ntag21x
```

## 🧑‍💻 Usage example

```ts
import { GetVersionCommand, WriteCommand } from 'ntag21x'

// Retrieve product information using the GET_VERSION command
const cmd0 = new GetVersionCommand()
const res0 = await communicateNfc(cmd0.build(), cmd0.timeoutMs)
const {
  parsed: { icType },
} = cmd0.parse(res0)

// Detected IC type
console.log(icType)

// WRITE command based on the detected IC type (e.g., page range)
const cmd1 = new WriteCommand(icType)
const res1 = await communicateNfc(
  cmd1.build(cmd1.userMemoryStartPage, new Uint8Array([0x00, 0x00, 0x00, 0x00])),
  cmd1.timeoutMs,
)
cmd1.parse(res1)
```

`communicateNfc()` handles communication with the NFC tag and is assumed to be provided by another library.

## 🙌 Contributing

This library is not a complete implementation of all NTAG21x commands. We welcome contributions to add more commands or improve existing ones. Feel free to open an issue or submit a pull request on GitHub. Your contributions are greatly appreciated!
