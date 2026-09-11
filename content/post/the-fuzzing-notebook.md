+++
date = "2026-06-29T20:25:59+03:00"
draft = false
title = 'The Fuzzing NoteBook'
cover = "posts-cover/anime-fuzz.jpg"
description = "Some Notes for Fuzzing, and doing the exercises from Fuzzing-Module."
categories = ["Notes"]
tags = ["Fuzzing", "C"]
+++
Now lets Start the Real Fun^^

## How to find Bugs ?
 
1. **Static Analysis**: look at the code without running it and find bugs (mistakes).
2. **Fuzzing**: Give the program lots of unexpected inputs , If one input crashes the program, you may have found a bug (^^ cash ^^) .

```py
imagine this:

Normal user: 
	input : hello

fuzzer:
	input : A
	input : AAAAAAAA
	input : \xff\x00\x01
	input : 10000 random bytes
```

### So what's fuzzing? What is the concept??

- **In basic terms**: Fuzzing is automatically giving a program lots of weird, unexpected, or random inputs to see if it breaks.
#### The concept =>

- The following concept is translated From [Frequently asked questions (FAQ)](https://aflplus.plus/docs/faq/)

> **Documentation**
> A program contains functions, functions contain the compiled machine code. The compiled machine code in a function can be in a single or many basic blocks. A basic block is the largest possible number of subsequent machine code instructions that has exactly one entry point (which can be be entered by multiple other basic blocks) and runs linearly without branching or jumping to other addresses (except at the end).

**Example:**
The following **A**, **B**, **C**, **D**, **E** are the basic blocks:
```c
function() {
  A:
    some
    code
  B:
    if (x) goto C; else goto D;
  C:
    some code
    goto E
  D:
    some code
    goto B
  E:
    return
}
```
An edge is then the unique relationship between two directly connected basic blocks (from the code example above), Every line between two blocks is an edge

![block diagram](/posts-imgs/fuzzing-notebook/image.png)

## Types of fuzzing :>

1. **Based on input Awareness**:
	1. **Dumb Fuzzer**: know nothing , Just throws random data, and that makes it to miss the deep bugs
	2. **Smart Fuzzer**: Understands the input format, instead of random JPEG bytes, it creates almost valid JPEG files this makes it explore much more code
2. **Based on input generation**:
	1. **Mutation-based**: starts from valid files, and changes them slightly maybe bit by bit or byte. (like what AFL++ mainly does)
	2. **Generation based**: creates files from scratch using rules, instead of mutating a PDF, it builds a PDF according to its specification.
3. **Based on knowledge of Target**:
	1. **White box**: source code available , you can use every detail 
	2. **Black box**: No source code , you can only observe the input > program > crash or not.
	3. **Grey box**: Most popular , no full source , but uses feedback like (code coverage) (AFL++ belongs here as well)
4. **Based on Target**:
	Different targets need different fuzzers.
	Examples:

	| target               | input                                          |
	| -------------------- | ---------------------------------------------- |
	| File fuzzing         | PDFs, PNGs                                     |
	| Network fuzzing      | Protocols                                      |
	| Command-line fuzzing | linux tools                                    |
	| Kernel fuzzing       | syscalls  or drivers                           |
	| Web fuzzing          | HTTP requests                                  |
	| Firmware fuzzing     | target it via emulation or hardware interfaces |
	| Browser fuzzing      | HTML/JS/CSS                                    |
	| Stateful fuzzing     | FTP, DHCP                                      |
	| Windows fuzzing      | winAFL                                         |


	Always understand your target before choosing a fuzzer.
	
---
## Instrumenting The Target

- **Instumetation** is adding extra code into the binary during compilation often at specific points like before (basic blocks, function calls) to collect information and it makes the compiled program looks like this

![alt text](/posts-imgs/fuzzing-notebook/image-1.png)
- This tracks which lines, basic blocks, or branches of code are executed by a given input.
### Instrumenting Types

1. **PCGUARD**: 
	- Compiler: `afl-clang-fast`
	- LLVM SanitizerCoverage
	- Instrumentation during **compilation**
	- Faster compile time
2. **LTO (Recommended)**
	- Compiler: `afl-clang-lto`
	- Instrumentation during **linking**
	- Better optimization
	- Usually best performance & coverage
3. **GCC Plugin**
	- Compiler: `afl-gcc-fast`
	- Uses GCC plugin
	- Use only if Clang/LLVM isn't available

---

### Sanitizers
- Sanitizers insert runtime checks to detect bugs.

| Sanitizer | Detects                                     |
| --------- | ------------------------------------------- |
| ASAN      | Buffer overflow, UAF, OOB, NULL dereference |
| MSAN      | Uninitialized memory reads                  |
| UBSAN     | Undefined behavior                          |
| CFISAN    | Invalid control flow / type confusion       |
| TSAN      | Thread race conditions                      |
| LSAN      | Memory leaks                                |

- **ASAN** is the most commonly used during fuzzing.
- Sanitizers slow execution (ASAN ≈ **2–3× slower**).
- Real fuzzing often runs:
  - One instance with ASAN
  - Other instances without sanitizers for speed.

## Demo
- Lets consider the following c program just to examine the basic usage of fuzzing and its idea
```c
#include <stdio.h>
#include <stdlib.h>

int isBigPrime(int n) {
  if (n <= 5)
    return 0;
  for (int i = 2; i * i <= n; i++)
    if (n % i == 0)
      return 0;
  return 1;
}

int main(void) {
  char s[35];
  scanf("%s", s);

  char cnt[300] = {0};

  for (int i = 0; s[i]; i++) {
    cnt[s[i]]++;
    if (s[i] < 'x' || s[i] > 'z') {
      puts("unacceptable");
      return 0;
    }
  }

  if (isBigPrime(cnt['x']) && isBigPrime(cnt['y']) && isBigPrime(cnt['z']))
    abort();

  puts("Nice string");

  return 0;
}
```
- **Input Limits**: The program only accepts strings consisting of characters `x`,`y`,`z`. If other characters are included,
The program will output the unacceptable and exit normally.
- **Counting statistics**: Counting the number of times each appears in the input string using `cnt` arrays
- **Trigger crash**:
  - The `isBigPrime` function checks whether a number is greater than 5 prime (e.g. 7, 11, 13, 17 etc.)
  - The program executes `abort` only if the number `x`, `y` and `z` are all prime numbers greater than 5 at the same time
- **Additional Bugs**:
  - `scanf` does not limit input length, there is stack overflow
---
**According to** [Selecting the best AFL++ compiler for instrumenting the target](https://aflplus.plus/docs/fuzzing_in_depth/#:~:text=a%29%20Selecting%20the%20best%20AFL%2B%2B%20compiler%20for%20instrumenting%20the%20target) we will use `afl-clang-lt` as the compiler for instrumentation

```bash
afl-clang-lto ./test.c -o test
```
- we can provide initial simples for the inputs as well and put them in the `inputs` directory 
```shell
mkdir inputs
nano inputs/text

aaaaabbbbddddddd
helloworld
xxxyyyzzzzzzxxxyyy
xxxzzzyyy
```
- maybe none of them will crash the program , but the thing is AFL++ can mutate these samples on its own and find an input that can crash the program
**Now Lets Fuzz**
```bash
afl-fuzz -i inputs -out/ ./test
```
and after just few seconds we will notice that we got some crashes, (aborts and stack overflow)

![alt text](/posts-imgs/fuzzing-notebook/test2.png)
- The inputs that caused the program to crash can be found in `out/default/crashes`
- And I use this script to check the input and crashes
```bash
#! /usr/bin/env bash

for f in out/default/crashes/id:*; do
  echo "=== $f ==="
  hexdump -C "$f" | head
  ./test <"$f"
done
```
---
## Fuzzing-Module

[Fuzzing-Module](https://github.com/alex-maleno/Fuzzing-Module) is the official AFL++ Beginners practice. there are three small exercises

### Exercise 1

- The source code => 
```cpp
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

using namespace std;

int main() {

  string str;

  cout << "enter input string: ";
  getline(cin, str);
  cout << str << endl << str[0] << endl;

  if (str[0] == 0 || str[str.length() - 1] == 0) {
    abort();
  } else {
    int count = 0;
    char prev_num = 'x';
    while (count != str.length() - 1) {
      char c = str[count];
      if (c >= 48 && c <= 57) {
        if (c == prev_num + 1) {
          abort();
        }
        prev_num = c;
      }
      count++;
    }
  }

  return 0;
}
```
- okay I will use the `afl-clang-lto++` as the instrumentation
```
CC=afl-clang-lto CXX=afl-clang-lto++
cmake ..
make
```
- First lets analyze a few places that can cause a crash 
  1. `str[0] == \x00`
  2. `str[str.length() - 1] == \x00`
  3. The next read num is one greater than the prev one example `12`
  4. `EOF`
  - okay now As required by the exercise 1 we will generate 5 seeds using this script:
  ```bash
  #!/usr/bin/env bash

	mkdir seeds
	for i in {0..4}; do
	  dd if=/dev/urandom of=seeds/seed_"$i" bs=64 count=10
	done
  ```
- now lets fuzz
	`afl-fuzz -i seeds -o out -m 0 -d -- ./build/simple_crash`

After a few seconds I found 3 crashes

![alt text](/posts-imgs/fuzzing-notebook/test3.png)
- it feels amazing when i see those crashes XD

> **Note:** crashes analyses
> 1. okay the first crash `id:000000` this matches our second case
> 2. the second crash `id:000001` matches our third case
> 3. and the third one `id:000002` matches our first case 


 **As you surely notice the fuzzer didn't detect our last case which is `EOF`**
 This is mainly caused by its result this specific input `EOF` will cause **undefine Behaviour** 
 
**Possible results:**
- Crash
- No crash
- Garbage value
- Different behavior every run

Because it is **not reproducible**, AFL++ usually marks it as **flaky** and discards it.
- so we need to enhance its crash performance somehow to make it more certain like this maybe:
```c
  if(str.length() == 0)
	  abort();
```
- or we can use the AddressSanitize `ASAN` and UndefinedBehaviorSanitizer `UBSAN`

> **Note:** Compiling with sanitizer
> ```bash
> cmake -S . -B build \
> -DCMAKE_C_COMPILER=afl-clang-lto \
> -DCMAKE_CXX_COMPILER=afl-clang-lto++ \
> -DCMAKE_C_FLAGS="-O1 -g -fno-omit-frame-pointer -fsanitize=address,undefined" \
> -DCMAKE_CXX_FLAGS="-O1 -g -fno-omit-frame-pointer -fsanitize=address,undefined"
> ```
> **Why these flags?**
> 1. `-O1` small optimization just to make debugging easier
> 2. `-g` also makes debugging with gdb much easier it tells u exactly at which line in the source the binary crashed
> 3. `-fno-omit-frame-pointer` Produces accurate stack traces.
> 4. `fsanitize=address,undefined` enables both ASan and UBSan.
> ---
> Okay before fuzzing we need to set these vars
> ```bash
> export ASAN_OPTIONS=abort_on_error=1:symbolize=0:detect_leaks=0
> export UBSAN_OPTIONS=abort_on_error=1
> ```
> **WHY?**
> 1. `symbolize=1` it prints `simple_crash.cpp:15` instead of just an address "much easier to debug"
> 2. `print_stacktrace=1` prints the call stack where the bug occurred
> **And for better Debugging Use this one**
> ```bash
> export ASAN_OPTIONS=abort_on_error=1:symbolize=1:detect_leaks=0
> export UBSAN_OPTIONS=abort_on_error=1:print_stacktrace=1
> ```
---
### Exercise 2

- This one is easy , the only condition to abort is to enter `ffl` this will trigger it
```cpp
} else if (input[i] == 'l') {
    if (crew.num == 0) {
        abort();
    }
    land();
}
```
- I used the same pervious seed ( I know its a bit missy But I like it XD)

![alt text](/posts-imgs/fuzzing-notebook/test4.png)
- by observing the crashes they all about the `ffl` but with different paths in the code
---
### Exercise 3

- Hmmmm Too much code in here so we will use [Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail) as the guide says
- okay Next lets search for the abort points
	1. `choose_color` If we entered a pure number
	2. `main_alt` input negative number 
	3. `main_airspeed` input negative number
	4. `fuel_cap` input negative number
	5. `check_alt`  if the `alt` is less than 0
	6. `check_fuel` if the `fuel` is less than 0
	7. `check_speed` if the `speed` is less than 0


> **Note:** [Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail/releases)
> in such projects that have lots of files, headers, classes sourcetrail is a really big help for us it helps us to trace the functions and map it in a very easy way 

- In this exercise we need to use a really important technique **create a slice** its basically that we want to narrow down the code that will be running as much as possible. so instead for example fuzzing a full drone system we will slice it to just fuzz the GPS module or something
- For the slice, you can comment out some of the code in the target to ignore features that you are not interested in fuzzing.

**This exercise gives us a template for a slice `specs_slice`** so we will fuzz only the `specs class ` and test the `choose_color` function specifically
```cpp
/*
 *
 *
 * This file isolates the Specs class and tests out the 
 * choose_color function specifically.
 * 
 * 
 * 
 */

#include "specs.h"

int main(int argc, char** argv) {
    // In order to call any functions in the Specs class, a Specs
    // object is necessary. This is using one of the constructors
    // found in the Specs class.
    Specs spec(505, 110, 50);
    // By looking at all the code in our project, this is all the 
    // necessary setup required. Most projects will have much more
    // that is needed to be done in order to properly setup objects.

    // This section should be in your code that you write after all the 
    // necessary setup is done. It allows AFL++ to start from here in 
    // your main() to save time and just throw new input at the target.
    #ifdef __AFL_HAVE_MANUAL_CONTROL
        __AFL_INIT();
    #endif

    spec.choose_color();
    //spec.min_alt();

    return 0;
}
```
- We can set the fuzz entry by defining `__AFL_HAVE_MANUAL_CONTROL`, 
	- `__AFL_INIT()` tells **AFL++** to start fuzzing only after your program's initialization is complete, so it skips one-time setup and focuses on the target code 

We will test `chosse_color` first , we know if we entered a pure number it will collapse so lets fuzz and see

![alt text](/posts-imgs/fuzzing-notebook/test5.png)
wooh more crashes than i expected, lets analyze them.
1. okay the first crash input is like this `\x39\x0c\x36` we know that `cin` stops at white space so it will take the first digit `9` and ignores the others , so the digit now aborts the program
2. the second and fourth one are simple  they are pure digits so it will crash the program
3. the third one its `\x09\x09` its `\t\t` so when it tries to saves an empty color so this loop right here will return true , and returning true causes a crash
	```cpp
	std::cin >> color;
	if (isNumber(color))
	  abort();
	
	bool Specs::isNumber(std::string str) {
	  for (int i = 0; i < str.length(); i++) {
	    if (isdigit(str[i]) == 0)
	      Return to False;
	  }
	  return true;
	}
	``` 

---
**Lets fuzz one more function `min-airspeed`**
- first i used this slice
```cpp
#include "specs.h"

int main(int argc, char** argv) {
    Specs spec(505, 110, 50);
    #ifdef __AFL_HAVE_MANUAL_CONTROL
        __AFL_INIT();
    #endif

    spec.min_airspeed();

    return 0;
}
```

**Don't forget** to add this line in the `CMakeLists.txt` 
>`add_executable(min-airspeed-slice min-airspeed-slice.cpp specs.cpp)` 

and then build again

- I fuzzed this function specifically to see how the exec speed gonna increase  since this function has a loop and may ask for more than one input in different paths. 
```cpp
void Specs::min_airspeed() {
  bool out_of_bounds = true;
  std::cout << "enter aircraft minimum airspeed:";
  std::cin >> speed;
  do {
    out_of_bounds = false;
    if (speed < 0)
      abort();
    if (speed < 100) {
      std::cout << "too low. please re-enter:";
      std::cin >> speed;
      out_of_bounds = true;
    } else if (speed > 200) {
      std::cout << "too high. please re-enter:";
      std::cin >> speed;
      out_of_bounds = true;
    }
  while (out_of_bounds);
}
```

- As I expected the exec speed was too slow `60/sec`  but we got some crashes

![alt text](/posts-imgs/fuzzing-notebook/test1.png)

- The fourth crash is a bit interesting the input `11111-11+13` crashes the program because `std::cin >>` automatically splits the input while reading integers It first reads `11111` and leaves `-11+13` in the input buffer since `11111` is greater than `200` the program asks for another input the next `std::cin >>` speed reads `-11` from the remaining buffer and stops before the `+` now speed is negative so the program reaches `abort()`
---
okay that's it , I won't fuzz the other function cause they are easier and it will be a waste of time to fuzz them.