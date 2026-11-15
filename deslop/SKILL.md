---
name: deslop
model: opus
description: Extract key information from AI documents by removing nonsense words like ’It’s X, not Y’. The skill can also be used to create new content.
license: Apache-2.0
metadata:
    author: Chris Centrella
    version: 1.0
---

## Instructions

AI often uses sentence constructs that are syntactically correct, but don’t make sense semantically. It adds a significant amount of fluff; a large amount of its content don’t actually add any additional value.

Sometimes, this comes from the overly long conclusion and AI’s tendency to repeat the same thing multiple times, i.e., unnecessary repetition.

At other times, it repeats this in a more subtle way using the contrastive structure. It tends to use phrases like “Not just for X, but Y” and using “and” to restate what was already said.

Finally, it tends to use monotonous sentences which are of the same long length and often contain complex structures for no reason.

You are writing this for something who thinks very logically, trying to make every association important. Phrases like “X, and Y” when Y is the same thing as X, and “X, not Y” when Y is irrelevant, make it very hard for them to read, because the associations don’t make sense. 

Give me the basic points of what is being written, while not repeating the same thing multiple times. Use concise language and avoid all filler words. Your response should use an 8th grade reading level:

1. Remove excessive fluff and repetition
2. Remove contrastive phrases
3. Use simple sentence structures and add variance, instead of making them all the same length and complexity.
4. If any part of the output doesn’t add something new, just omit it. Optimize for conciseness not length.

Finally, make sure your output meets all items in the checklist before responding.

## Examples of AI Slop

These are the kinds of phrases to remove:

1. Using “and” to repeat what was already true.

> Prompt: I thought BFS is for searching horizontally not vertically.
> AI: You are right, and BFS traverses one level at a time, rather than going down first.

Using `and` here makes no semantic sense, because the phrase after is restating what was already true.

2. Using “not” for something that is *technically* not true, but creates confusion because the user would never naturally make that association.

> AI: BFS is used for traversing graphs one level at a time, not storing data in a hash map.

“Not going depth first” might make sense, but “not storing data in a hash map” is irrelevant. Furthermore, even if the association were relevant, the contrastive structure is overused, so avoid all “Not just X but Y” and similar statements.

3. Repeating fluff to use more tokens.

Sometimes a document like a PRD will contain about 3-4 basic points, with the rest being AI making up slop to fill the space. To fix this, question small assumptions. For example, sometimes the reason that was given is irrelevant.

## Checklist

- [ ] No contrastive structures (e.g., “Not just X but Y” but there are other variations as well)
- [ ] No Markdown
- [ ] Sentence length and complexity varies
- [ ] No overly complex sentences
- [ ] Minimal repetitive phrases
