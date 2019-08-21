declare module NodeJS {
  interface Global {
    __EXT: {
      [key: string]: any
    }
  }
}
