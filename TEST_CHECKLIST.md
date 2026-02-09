# KYC View Modal - Test Checklist

## Quick Test Steps

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Login as Admin
- Navigate to http://localhost:5173/login
- Login with admin credentials
- Should redirect to Admin Dashboard

### 3. Access View KYC Modal
1. Click on a user in the table (one with KYC status = "pending", "approved", or "rejected")
2. Click "View KYC" button
3. Modal should open

### 4. Verify Data Display (Check in this order)

#### Step A: Check Debug Info Panel (Bottom of Modal)
- Look for the blue "Debug Info" section
- **Image URL**: Should show either:
  - ✓ Present (https://res.cloudinary.com/...) ✅ GOOD
  - ✗ Missing ❌ PROBLEM - See "Troubleshooting" section below

- **Video URL**: Should show either:
  - ✓ Present (https://res.cloudinary.com/...) ✅ GOOD
  - ✗ Missing ❌ PROBLEM - See "Troubleshooting" section below

#### Step B: Check Browser Console (F12)
Look for these logs (in order of execution):
1. `API Response:` - Full API response object
2. `First user:` - First user in list
3. `KYC Image URL:` - Image URL (if present) or undefined
4. `KYC Video URL:` - Video URL (if present) or undefined
5. When modal opens:
   - `Selected User:` - User object
   - `Image loaded successfully: https://...` OR `Image failed to load: https://...`
   - `Video loaded successfully: https://...` OR `Video failed to load: https://...`

#### Step C: Check Visual Display
- **Image Section**: 
  - Should display the image if kycImage URL is valid ✅
  - Should show "No Image Available" if missing ❌
  
- **Video Section**:
  - Should display video player with controls if kycVideo URL is valid ✅
  - Should show "No Video Available" if missing ❌
  - Audio should be audible when playing ✅

---

## Troubleshooting Decision Tree

### Q: Are the URLs showing in Debug Info?

**YES (✓ Present)** → Go to Step D below
**NO (✗ Missing)** → 
1. Check MongoDB: `db.kycs.find()`
2. Verify user has KYC record
3. Check if `imageUrl` and `videoUrl` exist in the KYC document
4. If missing, user needs to upload KYC again from KYC page

### Q: Are images/videos displaying on page?

**YES** → ✅ Everything is working!
**NO** → Check browser Network tab (F12 → Network)
1. Look for requests to `res.cloudinary.com`
2. Check Status code (should be 200)
3. If 404: File not found on Cloudinary (re-upload needed)
4. If 403: CORS issue or permission denied
5. If connection refused: Network issue

### Step D: Test Approve/Reject (if status is "pending")

1. Click "Approve" button (green) or "Reject" button (red)
2. Should see toast notification
3. Modal should close
4. User's KYC status in table should update
5. Check console for any errors

---

## Expected Behavior

✅ **Image Section**:
- Displays KYC image from Cloudinary
- Can click to open in new tab
- Has "Open in new tab" link below image

✅ **Video Section**:
- Displays video player with play/pause controls
- Audio is audible
- Can click to open in new tab
- Has "Open in new tab" link below video

✅ **User Info Section**:
- Shows email, user ID, joined date
- Shows KYC status badge

✅ **Action Buttons** (if status = "pending"):
- "Approve" button turns KYC status to "approved"
- "Reject" button turns KYC status to "rejected"
- "Close" button closes modal

---

## Console Log Reference

If you see these logs, the feature is working:

```javascript
// In Browser Console (F12 → Console Tab):

// 1. Initial load
"API Response:" 
"First user:"
"KYC Image URL: https://res.cloudinary.com/..."
"KYC Video URL: https://res.cloudinary.com/..."

// 2. When clicking View KYC
"Selected User:" { ... kycImage: "...", kycVideo: "..." ... }

// 3. Media loading
"Image loaded successfully: https://res.cloudinary.com/..."
"Video loaded successfully: https://res.cloudinary.com/..."
```

---

## If Still Not Working

1. **Restart both servers**:
   ```bash
   # Kill and restart backend
   npm run dev
   
   # Kill and restart frontend
   npm run dev
   ```

2. **Clear browser cache**:
   - F12 → Network tab → Check "Disable cache"
   - Or: Ctrl+Shift+Delete → Clear browsing data

3. **Check .env files exist**:
   ```
   backend/.env (CLOUDINARY_* variables)
   frontend/.env (VITE_API_BASE_URL if needed)
   ```

4. **Verify Cloudinary credentials**:
   - Login to Cloudinary dashboard
   - Confirm CLOUD_NAME, API_KEY, API_SECRET are correct
   - Check if files were actually uploaded

5. **Check network requests**:
   - F12 → Network tab
   - Filter by "img" or "media"
   - Look for failed requests
   - Check response headers for CORS issues
