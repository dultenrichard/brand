# Award collection

Add approved public certificate images (JPG, PNG, WebP) or PDF copies to this folder.
In `data/awards.json`, set the corresponding `image` or `document` field to a relative path such as `./assets/awards/strathcona.webp` or `./assets/awards/strathcona.pdf`. Add descriptive `alt` text for images and an optional short `caption`.

Entries with both fields set to null stay out of the gallery. The existing award story remains available. One populated entry replaces the empty collection state automatically. Images link to their original file; a document gets a separate viewing link.

Crop or redact personal addresses, cadet/service numbers, signatures, and other details you do not want public before adding a file. This is a public GitHub Pages site; there is no public upload form or backend. Commit the files and manifest together to publish them.
