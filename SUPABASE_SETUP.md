# Free model storage setup

This website uses Supabase Storage on its free tier for private 3D model files and public product preview images. A Supabase account/project is not included or created for you, so complete these steps before uploading.

## 1. Create the Supabase project

1. Create a free project at [supabase.com](https://supabase.com/).
2. In **Project Settings > API**, copy the Project URL and the public `anon`/publishable key.
3. Open `supabase-config.js` and enter those two public values in `url` and `anonKey`.
4. Never put a `service_role` or secret key in website files, a browser, or chat.

## 2. Create your private creator account

1. In the Supabase dashboard, open **Authentication > Users** and add a user with your email and a password.
2. Keep public sign-ups disabled. The upload screen is sign-in only; it does not create accounts for visitors.
3. In **Authentication > URL Configuration**, add the deployed website URL to the allowed site/redirect URLs.

## 3. Create the database and storage rules

1. Open **SQL Editor** in Supabase.
2. Open `supabase-setup.sql`, paste its contents into a new SQL query, and run it.
3. Confirm the `jewellery_models` table and the `jewellery-model-files` and `jewellery-previews` buckets exist.

The SQL enables row-level security. Model files are private; preview images and published listing details are public. Each signed-in account can upload, edit, publish, and delete only its own records and files. New listings stay unpublished until you choose **Publish**.

## 4. Host and use the website

Deploy the website folder to an HTTPS static host, or serve it locally over `http://localhost` for testing. Do not open `index.html` as a `file://` URL; browser authentication and storage APIs need an HTTP(S) origin. Then choose **Sell a model**, sign in, add a title, description, price, model file, and preview image.

The uploader currently allows one model file up to 50 MB and a JPG, PNG, or WebP preview up to 5 MB. Supported model extensions: BLEND, FBX, OBJ, STL, GLB, GLTF, 3MF, STEP, and IGES. Free storage quotas and provider limits can change; check the current Supabase plan before uploading large collections.

This adds model storage and public catalogue listings only. Checkout/payment processing and secure paid downloads are separate integrations and remain disabled until a payment provider is connected.
