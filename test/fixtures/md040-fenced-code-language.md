# MD040-fix: Fenced code language

Block with no language (default or inferred):

```
just plain text
```

Block that should infer to bash:

```
$ npm install foo
curl -s https://example.com
```

Block that should infer to JSON:

```
{"name": "test", "count": 42}
```

Block that should infer to JavaScript:

```
const x = 1;
export function foo() {}
```

Block that should infer to Perl (shebang):

```
#!/usr/bin/env perl
my $x = 1;
print "hello\n";
```

Block that is Perl but has no shebang (not covered by inferrer; gets default language, e.g. text):

```
my $name = shift;
while (<>) { chomp; say $_ if /$name/; }
```

Block that should infer to Ruby (shebang):

```
#!/usr/bin/env ruby
puts "Hello"
```

Block that should infer to Python:

```
def main():
    print("hi")
```

Block that should infer to PHP:

```
<?php
echo $foo;
```

Block that should infer to YAML:

```
key: value
list:
  - a
  - b
```

Block that should infer to SQL:

```
SELECT * FROM users WHERE id = 1;
```
