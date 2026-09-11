+++
date = '2026-07-23T15:18:47+03:00'
draft = false
title = 'CVE-2019-13288: Xpdf'
cover = "/posts-cover/xpdf-cover.gif"
description = "Fuzzing Xpdf-3.02 to reproduce CVE-2019-13288, 'Exercise 1 from fuzzing101 repo'"
categories = ["CVE"]
tags = ["Fuzzing", "C++"]
+++

## Info 
Okay in this post I will do this [exercise 1 ](https://github.com/antonio-morales/Fuzzing101/tree/main/Exercise%201) which is fuzzing XPDF 3.02 to reproduce this [CVE-2019-13288](https://web.archive.org/web/20260313030036/https://www.cve.org/CVERecord?id=CVE-2019-13288).

## Download & build
- use this command to download the version 3.02 I know in the CVE the version is 4.01.01 but as the exercise want we will work with 3.02
``` bash
wget https://dl.xpdfreader.com/old/xpdf-3.02.tar.gz
tar -zxvf xpdf-3.02.tar.gz
```

### build
- I will build two versions one with LTO mode
``` bash
cd xpdf-3.02
CC=afl-clang-lto CXX=afl-clang-lto++ ./configure --prefix="$PWD/install"
make -j`nproc`
make install
```
- And another debuggin version 
``` bash
CC=clang CXX=clang++ CFLAGS="-O0 -g -gdwarf-4 -fno-inline -fno-builtin -fno-omit-frame-pointer" CXXFLAGS="$CFLAGS" ./configure --prefix="$PWD/install-dbg"
make -j`nproc`
make install
```

---
## Corpus
- In this step I used ai to write a script that generates some small seeds .

```generate_seeds.py 
#!/usr/bin/env python3

import os

OUTDIR = "targeted_corpus"
os.makedirs(OUTDIR, exist_ok=True)


def write_pdf(filename, objects):
    pdf = b"%PDF-1.4\n"

    offsets = [0]

    for objnum, body in objects:
        offsets.append(len(pdf))
        pdf += f"{objnum} 0 obj\n".encode()
        pdf += body
        if not body.endswith(b"\n"):
            pdf += b"\n"
        pdf += b"endobj\n"

    xref = len(pdf)

    pdf += f"xref\n0 {len(offsets)}\n".encode()
    pdf += b"0000000000 65535 f \n"

    for off in offsets[1:]:
        pdf += f"{off:010d} 00000 n \n".encode()

    pdf += (
        f"""trailer
<<
/Size {len(offsets)}
/Root 1 0 R
>>
startxref
{xref}
%%EOF
""".encode()
    )

    with open(os.path.join(OUTDIR, filename), "wb") as f:
        f.write(pdf)


# --------------------------------------------------------
# Common objects
# --------------------------------------------------------

CATALOG = b"<< /Type /Catalog /Pages 2 0 R >>"

PAGES = b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"

PAGE = b"""<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/Contents 4 0 R
>>"""


# --------------------------------------------------------
# 1. Normal PDF
# --------------------------------------------------------

stream = b"""<< /Length 35 >>
stream
BT
/F1 18 Tf
72 720 Td
(Hello) Tj
ET
endstream
"""

write_pdf(
    "00_normal.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (4, stream),
    ],
)

# --------------------------------------------------------
# 2. Indirect Length
# --------------------------------------------------------

stream = b"""<< /Length 5 0 R >>
stream
BT
/F1 18 Tf
72 720 Td
(AAAA) Tj
ET
endstream
"""

write_pdf(
    "01_indirect_length.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (4, stream),
        (5, b"35"),
    ],
)

# --------------------------------------------------------
# 3. Reference chain
# 5 -> 6 -> 7 -> 35
# --------------------------------------------------------

stream = b"""<< /Length 5 0 R >>
stream
BT
/F1 18 Tf
72 720 Td
(BBBB) Tj
ET
endstream
"""

write_pdf(
    "02_chain.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (4, stream),
        (5, b"6 0 R"),
        (6, b"7 0 R"),
        (7, b"35"),
    ],
)

# --------------------------------------------------------
# 4. Long chain
# --------------------------------------------------------

objs = [
    (1, CATALOG),
    (2, PAGES),
    (3, PAGE),
]

objs.append(
    (
        4,
        b"""<< /Length 5 0 R >>
stream
ABC
endstream
""",
    )
)

for i in range(5, 20):
    objs.append((i, f"{i+1} 0 R".encode()))

objs.append((20, b"3"))

write_pdf("03_long_chain.pdf", objs)

# --------------------------------------------------------
# 5. Self reference
# --------------------------------------------------------

stream = b"""<< /Length 5 0 R >>
stream
ABC
endstream
"""

write_pdf(
    "04_self_reference.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (4, stream),
        (5, b"5 0 R"),
    ],
)

# --------------------------------------------------------
# 6. Two-object cycle
# --------------------------------------------------------

write_pdf(
    "05_cycle2.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (
            4,
            b"""<< /Length 5 0 R >>
stream
ABC
endstream
""",
        ),
        (5, b"6 0 R"),
        (6, b"5 0 R"),
    ],
)

# --------------------------------------------------------
# 7. Three-object cycle
# --------------------------------------------------------

write_pdf(
    "06_cycle3.pdf",
    [
        (1, CATALOG),
        (2, PAGES),
        (3, PAGE),
        (
            4,
            b"""<< /Length 5 0 R >>
stream
ABC
endstream
""",
        ),
        (5, b"6 0 R"),
        (6, b"7 0 R"),
        (7, b"5 0 R"),
    ],
)

print(f"[+] Generated targeted PDFs in {OUTDIR}/")

```

---
## Fuzzzing

- Okay now we can start fuzzing
```bash
afl-fuzz -i corpus/ -o out/ -s 127 -- ./install/bin/pdftotext @@ -
```
![first-crash](/posts-imgs/xpdf/crash.png)
And literally after **20 SEC** We got  A crash its not the crash we want but we got one XD.
so I waited about five minutes to gather some crashes and picked the one I need to replicate the vulnerability described in the CVE-2019-13288, so now lets analyze this DOS attack for this recursive stack calls.

![DOS](/posts-imgs/xpdf/DOS.png)

- The crash file
``` shell
%PDF-1.3
%���� ReportLab Generated PDF document (opensource)
1 0 obj
<<
/F1 2 0 R
>>
endobj
2 0 obj
<<
/Basbject (unspecifi /Encoding /WinAnsiEncoding /Name /F1 /Subtype /Type1 /Type /Font
>>
endobj
3 0 obj
<<
/Contents 11 0 R /MediaBox [ 0 0 595.2756 841.8898 ] /Parent 10 0 R /Resources <<
/Font 1 0 R /ProcSet [ /PDF /Text /ImageB /ImageC /ImageI ]
>> /Rotate 0 /Trans <<

>> 
  /Type /Page
>>
en''''''''''''''''''''dobj
4 0 obj
<<
/Contents 12 0 R /MediaBox [ 0 0 595.2756 841.8898 ] /Parent 10 0 R /Resources <<
/Font 1 0 R /ProcSet [ /PDF /Text /ImageB /ImageC /ImageI ]
>> /Rotate 0 /Trans <<

>> 
  /Type /Page
>>
endobj
5 0 obj
<<
/Contents 13 0 R /MediaBox [ 0 0 595.2756 841.8898 ] /Parent 10 0 R /Resources <<
/Font 1 0 R /ProcSet [ /PDF /Text /ImageB /ImageC /ImageI ]
>> /Rotate 0 /Trans <<

>> 
  /Type /Page
>>
endobj
6 0 obj
<<
/Contents 14 0 R /MediaBox [ 0 0 595.2756 841.8898;] /Parent 10 0 R /Resources <<
/Font 1 0 R /ProcSet [ /PDF /Text /ImageB /ImageC /ImageI ]
>> /Rotate 0 /Trans <<

>> 
  /Type /Page 
  /Type /Page
bj
<<
/Contents 15 0 R /MediaBox [ 0 0 595.2756 841.8898 ] /Parent 10 0 R /Resources <<
/Font 1 0 R /ProcSet [ /PDF /Text /ImageB /ImageC /ImageI ]
� /Rotate 0 /Trans <<

>> 
  /Type /Page
>>
endobj
8 0 obj
<<
/PageMode /UseNone /Pages 10 0 R  e /Catalog
>>
endobj
9 0 obj
<<
/Author (anonymoun.1M(_$ok1*IV\1,:U?1,:U?s) /CreationDat (D:20260722111000-04'00') /Creator (anonymous) /Keywords () /ModDate (D:20260722111000-04'00') /Producer (ReportLab PDF Library - \(opensource\)) 
  /SueFont /Helveticaed) /Title (untitled) /Trapped /False
>>
endobj
10 0 obj
<<
/Count 5 /Kids [ 3 0 R 4 0 R 5 0 R 6 0 R 7 0 R ] /Type /Pages
>>
endobj
11 0 obj
<<
/Filter [ /ASCII85Decode /FlateDecode ] /Length 96
>>
stream
GapQh0E=F,0U\H3T\pNYT^gKk?tc>IP,;W#U1^23ihPEM_?CW4KISi90MjG.ifICKNIo+@<!<@uKodj>&1ru)"YKeY)%cc~>endstream
endobj
12 0 obj
<<
/Filter [ /ASCI1 2 0 R
>>
endobj
2 0 I85Decode /FlateDecode ] /Length 96
>>
stream
GapQh0E=F,0U\H3T\pNYT^QKk?tc>IP,;W#U1^23ihPEM_?CW4KISi90MjG.ifICKNIo+@<!>W`Kodj>&1ru)"YKeY-P6:~>endstream
endobj
13 0 obj
<<
/Filter [ /ASCII85Decode /FlateDecode ] /Length 96\pNYT^QKk?tc>IP,;W#U1^23ihPEM_?CW4KISi90MjG.ifICKNIo+@<!=L@Kodj>&1ru)"YKeY2%]f~>endstream
endobj
14 0 obj
<<
/Filter [ /ASCII85Decode /FlateDecoPEM_?CW4KISi90Mj>>
stream
GapQh0E=F,0U\H3T\pNYT^QKk?tc>IP,;W#U1^23ihde ] /Length 96
G.iNIo+@<!?c+Kodj>&1ru)"YKeY6P0>~>endstream
endobj
15 0 obj
<<
/Filter [ /ASCII85Decode /FlateDecode ] /Length 96
>>
stream
GapQh0E=F,0U\H3T\pNYT^QKk?tc>IP,;W#U1^23ihPEM_?CWKISi90MjG.ifICKNIo+@<!<q0Kodj>&1ru)"YKeY;%Wj~>endstream
endobjf
0 16
0000000000 65535 f 
000000006000000092 00000 n 
0000000199 00000 n 
0000000404 00000 n 
0000000609 04000 n 
0000000814 00000 n 
0000001019 00000 n 
0000001224 00000 n 
0000001293 00000 n 
0000001554 00000 n 
0000001638 00000 n 
0000001824 00000 n 
0000002010 00000 n 
0000002196 00000 n 
0000002382 00000 n 
trailer
<<
/ID 
[<d30dfe8e2f532d7f65c78626cca1130b><d30dfe8e2f532d7f65c78626cca1130b>]
% Reporent -- digest (opensource)

/Info 9 /Root 8 0 R
/Size 16
>>
startxref
2568
%

```

---
## Analysis

### Understanding PDF Dictionaries

Before diving into the code lets understand how PDF objects are represented

``` PDF
11 0 obj
<<
    /Filter [ /ASCII85Decode /FlateDecode ]
    /Length 96
>>
stream
...
endstream
endobj
```

anything between 

``` PDF
<<
...
>>
```

is a dictionar, For example:

``` PDF
<<
/Filter [ /ASCII85Decode /FlateDecode ]
/Length 96
>>
```
contains two entries:

| Key    | Value                             |
| ------ | --------------------------------- |
| Filter | `[ /ASCII85Decode /FlateDecode ]` |
| Length | `96`                              |

internally Xpdf stores these key/values pairs as dictionary entries.

---
- Now lets get into it
Instead of focusing on the final SIGSEGV the interesting part of the backtrace is the recursive pattern that repeats over and over again so lets set breakpoints at those places and see which hits first to analyze the start of the recursive loop, And as expected we hit the `Parser:getObj` so the recursive ring will look like this
![alt text](/posts-imgs/xpdf/trace.png)

- And after several thousand iterations the process finally crashed.
and just by looking at the backtrace above we will notice that the `objNum = 2` never change, that means that the `Xpdf` binary keeps parsing the same pdf object again and again.

#### Understanding objNum

- I just want to quickly mention what is `objNum` so I don't cause any confusion at the future
inside `Parser::getObj()`

```Parser.cc

Object *Parser::getObj(Object *obj, Guchar *fileKey, 
                        CryptAlgorithm encAlgorithm, int keyLength, 
                            int objNum, int objGen)
```

- here objNum refers to the object number inside the PDF, for example:

```shell
2 0 obj
<<
...
>>
endobj
```

- this parsed as:

```shell
objNum = 2
objGen = 0
```
----

#### Inspecting Object 2

- The AFL generated crash file contained the following object

``` shell
2 0 obj
<<
/Basbject (unspecifi
/Encoding /WinAnsiEncoding
/Name /F1
/Subtype /Type1
/Type /Font
>>
endobj
```

- Hmmm at first glance nothing looked sus right? no `/Filter` entry no array nothing appeared that's capable of causing the recursion.
- yet we know that the debugger kept entering the `Stream::addFilters()` which then did this

``` C++
dict->dictLookup("Filter", &obj);
```

- At this point I stopped reading the corrupted PDF that AFL generated, cause its simply corrupted and contianed multiple syntax errors so maybe the metadata the binary extracts is different ( maybe different objNum, maybe the end of the  object is not terminated correctly and it will keep reading tell it reachs another object end) so I moved on and started inspecting the parser's internal data sturctures.

#### Inspecting the Dictionary

- first we will need to break inside `Stream:addFilters()` and examine the dictionary passed to the function and print its entries.

![alt text](/posts-imgs/xpdf/dict.png)
![alt text](/posts-imgs/xpdf/dict2.png)

- okay so its correct the parser passed a PDF dictionary into `Stream::addFilters()` and it has 3 entries.
- I inspected the three entries inside the dictionary and found this
> Entry 0
>
> Key = "Basbject"
> Value = objString
>
> ---
> Entry 1
> 
> Key = "Filter"
> Value = objArray
>
>---
> Entry 2
> 
> Key = "Length"
> Value = objInt

- And yes even though the original AFL crash file didn't visibly contain a `/Filter` field inside object 2 the parser's internal structure clearly did.
the parser was convinsed that object 2 contained 3 dictionaries

```PDF
<<
/Basbject (...)
/Filter [...]
/Length 96
>>
```

- And this explains why execution reached `Stream::addFilters()`, and we will notice that the `/filter` entry's value was an **Array** `objArray` that meant the parser was about to iterate over multiple filter entries now lets analyze what's stored inside this array.

- But first lets understand what does xpdf do when it sees the array
- basically when Xpdf parsed this object it creates an internal `Array` object that stores each element individually.
- In the `Stream::addFilters()` the parser iterates through this array using a simple loop

``` C++
else if (obj.isArray()) {
    for (i = 0; i < obj.arrayGetLength(); ++i) {
        obj.arrayGet(i, &obj2);

        if (obj2.isName()) {
            str = makeFilter(obj2.getName(), str, &params2);
        }
    }
}
```
The code is simple
1. Get the number of elements.
2. Read one element at a time.
3. If the element is a filter name create the corresponding filter.

Hmmmmm .... nothing here looks dangerous.

The important question is this:
> What does arrayGet() actually return for our crafted PDF?
---
#### Inspecting the Filter Array

- I inspected the array itself 

``` SHELL
pwndbg> p *dict->dict->entries[1].val.array
$27 = {
  xref = 0x5555559f6710,
  elems = 0x555555a146b0,
  size = 0x8,
  length = 0x8,
  ref = 0x1
}
```
The interesting field here is `length = 8` normally the `/Filter` array contains only one or two filters for example like in the crash file 

```PDF
/Filter [ /ASCII85Decode /FlateDecode ]
```

- But instead the parser believed this array contained eight elements , now we know for sure that the malformed input really altered the parser's internal representation.
- the array length is not important btw but the content is so lets inspect them
![alt text](/posts-imgs/xpdf/rec.png)

> The parser interpreted the first element as a name object and its value is `ASCI1` which is not a valid PDF filter
> I believe this value was orginally `ASCII85Decode` but AFL corrupted the name durring fuzzing
> but this isn't a problem, even though the filter name is invalid the parser still recognizes it as a name so the execution will continue normally so the first iteration loop will look like this -> 
> ```chart
>arrayGet(0)
>
>    ↓
>
>objName
>
>    ↓
>
>"ASCI1"
>
>   ↓
>
>makeFilter()
>```

- Okay now lets moving on to the second element
> ``` SHELL
>pwndbg> p dict->dict->entries[1].val.array->elems[1]
> $28 = {
>   type = objRef,
>   {
>     booln = 0x2,
>     intg = 0x2,
>     real = 9.8813129168249309e-324,
>     string = 0x2,
>     name = 0x2 <error: Cannot access memory at address 0x2>,
>     array = 0x2,
>     dict = 0x2,
>     stream = 0x2,
>     ref = {
>       num = 0x2,
>       gen = 0x0
>     },
>     cmd = 0x2 <error: Cannot access memory at address 0x2>
>   }
> }
> ```
> now we are talking .... unlike the first element this isn't a filter name at all it's an indirect PDF reference `2 0 R`

- So what's `2 0 R`? whenever PDF contains it , it doesn't store data directly but instead it tells the parser go fetch object number 2 generation 0 ( think of it as a pointer) for example

``` SHELL 
/Font 2 0 R
```
means : the actual font object is stored in object 2
- okay now the problem here is which object is being referenced **2**
- remeber that the recursive loop started from calling `Parser::getObj()` with `objNum=2` yes the parser is already processing object 2
- now while parsing object 2 it encounters a reference that tells it to `Fetch object 2 ` 
- At this point it seems like the parser should detect that it's already parsing object 2 but sadly when `Stream::addFilters()` process the array it simply asks for the next element.

---
- Next to see how this reference is resolved i stepped through the code in GDB 
> Tha parser first calls 
> ``` C++
> obj.arrayGet(1, &obj2);
> ```
> inside `Array:get()` instead of returning the element directly XPDF resolves it using 
> ``` C++
> return elems[i].fetch(xref, obj);
> ```
> and since the second element is an indirect refernce (`2 0 R`) the code will enter the `Object::fetch()` which will call 
> ``` C++
> xref->fetch(ref.num, ref.gen, obj);
> ```
> which after that calls `parser->getObj(..., num, gen);`
> and so it will start parsing object 2 again and again and agian

![alt text](/posts-imgs/xpdf/rec2.png)

- since Xpdf never checks whether object 2 is already being parsed this loop repeats indeinitely until the process exhausts the stack and crashes

----
## The Fix

- After checking the adobe documentation for PDFs I found that the value of the filter can't be a refernced object 
![alt text](/posts-imgs/xpdf/docs.png)

- so we can basically block indirect Reference (`objRef`) in Filter.

```cpp {hl_lines=[23,"28-34"]}
Stream *Stream::addFilters(Object *dict) {
  Object obj, obj2;
  Object params, params2;
  Stream *str;
  int i;

  str = this;
  dict->dictLookup("Filter", &obj);
  if (obj.isNull()) {
    obj.free();
    dict->dictLookup("F", &obj);
  }
  dict->dictLookup("DecodeParms", &params);
  if (params.isNull()) {
    params.free();
    dict->dictLookup("DP", &params);
  }
  if (obj.isName()) {
    str = makeFilter(obj.getName(), str, &params);
  } else if (obj.isArray()) {
    for (i = 0; i < obj.arrayGetLength(); ++i) {
      // don't auto resolve indirect references.
      obj.arrayGetNF(i, &obj2);
      if (params.isArray())
	params.arrayGet(i, &params2);
      else
	params2.initNull();
      if(obj2.isRef()){
        error(getPos(), "Indirect references are not allowed in filter arrays");
        str = new EOFStream(str);
        obj2.free();
        params2.free();
        break;
      }
      else if (obj2.isName()) {
	str = makeFilter(obj2.getName(), str, &params2);
      } else {
	error(getPos(), "Bad filter name");
	str = new EOFStream(str);
      }
      obj2.free();
      params2.free();
    }
  } else if (!obj.isNull()) {
    error(getPos(), "Bad 'Filter' attribute in stream");
  }
  obj.free();
  params.free();

  return str;
}
```

![alt text](/posts-imgs/xpdf/fix.png)