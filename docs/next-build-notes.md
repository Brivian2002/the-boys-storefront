# Build note

During validation, Next.js 16 produced a prerender failure on `/_global-error` with `Cannot read properties of null (reading 'useContext')`. Public issue and discussion references describe this as a known class of Next.js/React global-error prerender problem:

- https://github.com/vercel/next.js/discussions/82499
- https://github.com/vercel/next.js/issues/84994
- https://nextjs.org/docs/messages/prerender-error

The replacement was pinned to Next.js 15.5.7, which moved validation past the React hook failure; the remaining build issue is a separate legacy document-component error and is still being corrected before push.
