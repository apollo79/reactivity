# reactivity

This repository is the result of my attempt to understand how
[SolidJS](https://solidjs.com) reactivity works.

It provides the following methods: `createSignal`, `createEffect`, `createMemo`,
`createRoot`, `getContext`, `setContext`, `onDispose`, `onError`, `untrack`,
`tick`, `getOwner` and `runWithOwner`.

## Developing

This repository uses `deno` as runtime, because of its good integration with
`Typescript` and its `built-in test runner`.

### Testing

For running the tests, run `deno task test`. This will generate a coverage
report under `cov_profile`

### Coverage

For printing the coverage, run `deno task coverage`

## The journey

As stated above, this repository started out as an attempt to understand how the
reactive core of SolidJS works, but as I was not able to grasp it by looking at
the
[SolidJS implementation](https://github.com/solidjs/solid/tree/main/packages/solid/src/reactive/signal.ts),
I had to find different sources. The first and easiest explanation I found is
this article from Ryan Carniato, the creator of SolidJS, on
[dev.to](https://dev.to):

[Building a reactive library from scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)

But, as he mentions in his write-up, the system used in SolidJS is much more
complicated. After some search, I found
[flimsy](https://github.com/fabiospampinato/flimsy):

> A single-file <1kb min+gzip simplified implementation of the reactive core of
> Solid, optimized for clean code.

The
[annotated source code](https://github.com/fabiospampinato/flimsy/blob/master/src/flimsy.annotated.ts)
really helped me to get an understanding of how a more advanced reactivity
system could look like.

But after a few days in which I had implemented flimsy step by step myself to
understand it, I found out about
[reactively](https://github.com/modderme/reactively) and its attempt on
`lazy memos`. It took me some time to implement them and in the time of doing it
I found the
[implementation of MaverickJS](https://github.com/maverick-js/signals) which
helped me much, as it also provides a scheduler to execute effects.

This repository and my current understanding of reactivity was only made
possible by these implementations and of course their impelementors. Thanks to
them!

For anyone who will get here and wants to understand how reactivity works, I
will list my sources here again:

- [Building a reactive library from scratch](https://dev.to/ryansolid/building-a-reactive-library-from-scratch-1i0p)
- [flimsy](https://github.com/fabiospampinato/flimsy)
- [reactively](https://github.com/modderme/reactively)
- [@maverick-js/signals](https://github.com/maverick-js/signals)
- ...and of course now this repository 😉. I have made comments in the
  [objects folder](https://github.com/apollo79/reactivity/tree/clean-code/src/objects)
  trying to make it understandable, but I recommend implementing your own
  system, as it makes it much easier to understand a complex subject like
  reactivity and will provide you more in-depth knowledge in the end
