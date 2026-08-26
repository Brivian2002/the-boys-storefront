# Selar checkout implementation notes

La Glitz uses Selar as an external checkout destination rather than a browser-exposed payment API. Selar’s official direct-checkout guidance supports adding `?add_to_cart=1` to a Selar product URL; optional `email`, `fullname`, and `mobile` parameters can prefill checkout fields when appropriate.[1]

For each sellable Blogger product post, create the corresponding product in Selar first. Then include its `https://selar.co/...` product URL in the Blogger post body, for example as a clearly labelled **Buy on Selar** link. The La Glitz server accepts only an HTTPS `selar.co` URL, adds the official direct-checkout parameter, and exposes it only on the matching product detail page. The post continues to control La Glitz discovery, imagery, classification, and pricing display; Selar controls payment and the hosted purchase experience.

## References

[1] [Selar: How to Direct Customers Straight to Checkout](https://help.selar.com/portal/en/kb/articles/how-to-direct-customers-straight-to-checkout)
