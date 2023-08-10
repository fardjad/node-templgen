# TemplGen Example

This is an example of how to use TemplGen.

## How to run

```bash
npm install
npm start -- -c content -n 9 -p prefix
```

It should output the following:

```
Templates directory:

templates
├── copy_as_is.txt
├── dynamic_content.txt.template
└── nested
    └── __dynamic_filename__.txt.template

Generating files...

Writing file: nested/prefix_1.txt
Writing file: nested/prefix_2.txt
Writing file: nested/prefix_3.txt
Writing file: nested/prefix_4.txt
Writing file: nested/prefix_5.txt
Writing file: nested/prefix_6.txt
Writing file: nested/prefix_7.txt
Writing file: nested/prefix_8.txt
Writing file: nested/prefix_9.txt
Writing file: dynamic_content.txt
Writing file: copy_as_is.txt

Done

Target directory:
generated
├── copy_as_is.txt
├── dynamic_content.txt
└── nested
    ├── prefix_1.txt
    ├── prefix_2.txt
    ├── prefix_3.txt
    ├── prefix_4.txt
    ├── prefix_5.txt
    ├── prefix_6.txt
    ├── prefix_7.txt
    ├── prefix_8.txt
    └── prefix_9.txt
```
