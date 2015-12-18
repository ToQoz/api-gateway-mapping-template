module.exports = [
  {
    template: '"$input.path(\'$\')"',
    payload: "a=b",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: '"a=b"',
    headers: {},
  },
  {
    template: '$input.json(\'$\')',
    payload: "a=b",
    headers: {},
  },
  {
    template: '$input.json(\'$\')',
    payload: '"a=b"',
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "{}",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: '"{}"',
    headers: {},
  },
  {
    template: '$input.json(\'$\')',
    payload: "{}",
    headers: {},
  },
  {
    template: '{"name": "$input.path(\'$\')"}',
    payload: "name=toqoz",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "{a",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "a{b",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "[a",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "a[",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "null{",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "true{",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "false{",
    headers: {},
  },
  {
    template: '"$input.path(\'$\')"',
    payload: "undefined{",
    headers: {},
  },
  {
    template: '$input',
    payload: "",
    headers: {},
  },
  {
    template: '$input.keySet',
    payload: "",
    headers: {},
  },
  {
    template: '$input.params.keySet',
    payload: "",
    headers: {},
  },
  {
    template: '$util',
    payload: "",
    headers: {},
  },
  {
    template: '$input.params',
    payload: "",
    headers: {},
  },
  {
    template: '$input.json',
    payload: "",
    headers: {},
  },
  {
    template: '$util.urlEncode',
    payload: "",
    headers: {},
  },
];
