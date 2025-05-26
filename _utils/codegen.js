const password = Bun.argv[2];
const hash = await Bun.password.hash(password);
console.log(btoa(hash))
