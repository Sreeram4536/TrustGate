# KYC View Modal - Debugging & Fixes

## Issues Fixed

### 1. **Frontend - AdminDashboard.tsx**
   - ✅ Added enhanced console logging to check if Cloudinary URLs are being received
   - ✅ Added `crossOrigin="anonymous"` attribute to both `<img>` and `<video>` tags
   - ✅ Added `onError` and `onLoad`/`onLoadedData` event handlers to detect loading failures
   - ✅ Added Debug Info panel in the modal to display URL presence and status
   - ✅ Fixed React console.log statements (changed from JSX to proper logging)

### 2. **Backend - server.ts**
   - ✅ Updated CORS configuration with explicit origin and credentials
   - ✅ Added proper error handling for Cloudinary requests

## Current Data Flow

1. **Admin fetches users** → `/api/users` endpoint
2. **Backend aggregation pipeline**:
   - Matches users with `role: 'user'`
   - Performs `$lookup` on KYC collection
   - Maps KYC fields: `imageUrl` → `kycImage`, `videoUrl` → `kycVideo`
   - Returns fields: `kycStatus`, `kycImage`, `kycVideo`

3. **Frontend receives** the user objects with:
   ```typescript
   {
     id: string,
     email: string,
     role: string,
     joinedAt: string,
     kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted',
     kycImage?: string,  // Cloudinary URL or undefined
     kycVideo?: string   // Cloudinary URL or undefined
   }
   ```

## How to Verify It's Working

### Step 1: Check Browser Console
Open the browser's Developer Console (F12) and look for:
- `API Response:` - Shows the full API response
- `First user:` - Shows the first user object
- `KYC Image URL:` - Shows the image URL value
- `KYC Video URL:` - Shows the video URL value

### Step 2: Open Admin Dashboard
1. Go to Admin Dashboard
2. Click "View KYC" on any user with pending/approved/rejected KYC status
3. Look at the **Debug Info** section at the bottom of the modal
   - Should show: `Image URL: ✓ Present (https://res.cloudinary.com/...)`
   - Should show: `Video URL: ✓ Present (https://res.cloudinary.com/...)`

### Step 3: Check Media Loading
In the browser console (F12), look for:
- ✅ `"Image loaded successfully: https://res.cloudinary.com/..."`
- ✅ `"Video loaded successfully: https://res.cloudinary.com/..."`

OR

- ❌ `"Image failed to load: https://res.cloudinary.com/..."` + error object
- ❌ `"Video failed to load: https://res.cloudinary.com/..."` + error object

## Troubleshooting

### If URLs are missing (showing ✗ in Debug Info)

**Problem**: Backend is not returning `kycImage` and `kycVideo` fields

**Solution Check**:
1. Verify KYC documents were uploaded in the first place
2. Check MongoDB - inspect the KYC collection:
   ```
   db.kycs.findOne()
   ```
   Should show `imageUrl` and `videoUrl` fields with Cloudinary URLs

3. Check if User model has proper relation to KYC
   - Ensure `_id` in users matches `user` field in kycs

### If URLs are present but media not loading (❌ error in console)

**Problem**: CORS issue or invalid Cloudinary URL

**Solution**:
1. Check browser Network tab (F12 → Network tab)
   - Look for requests to `res.cloudinary.com`
   - Check the response status (should be 200, not 403/401)

2. Verify Cloudinary configuration:
   ```bash
   # Check .env file has these variables:
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Test Cloudinary URL directly in browser:
   - Copy the URL from Debug Info
   - Paste in new tab
   - If it shows 404, the file wasn't uploaded to Cloudinary

### If only audio is playing (video plays but no video track)

**Problem**: Video might be uploaded without proper codec or Cloudinary transformation

**Solution**:
1. Use browser developer console → Network tab
2. Find the video request and check:
   - Content-Type header (should be `video/mp4` or similar)
   - Content-Length (should be > 0)

3. Try adding `?resource_type=video` to the video URL

## Next Steps if Still Not Working

1. **Check backend logs**:
   ```bash
   # Terminal where backend is running should show upload success
   npm run dev
   # Look for: "KYC Upload Error:" or "KYC submitted successfully"
   ```

2. **Test KYC upload directly**:
   - Go to KYC page and submit image + video
   - Watch browser Network tab during upload
   - Should see POST to `/api/kyc/upload`
   - Response should contain `imageUrl` and `videoUrl`

3. **Database check**:
   ```bash
   # In MongoDB:
   use image_kyc_db
   db.kycs.find().pretty()
   ```
   Look for documents with both `imageUrl` and `videoUrl` fields

## Files Modified

- `frontend/src/pages/AdminDashboard.tsx` - Enhanced logging, error handlers, debug panel
- `backend/src/server.ts` - Improved CORS configuration
