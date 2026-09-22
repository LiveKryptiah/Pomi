# 🐾 MyPet — Pet ID & QR Recovery Web App

> **A little tag. A big way home.**  
> *Give your pet an identity. Help them find their way back home.*

**MyPet** is a responsive digital pet identification and lost-pet recovery platform designed in the **Geniestudio visual aesthetic**: an airy, daylight-studio language featuring a pale sky-blue canvas (`#ebf5ff`), paper-like bone white surfaces (`#fafdff`), mid-weight 500 typography with tight negative tracking, dense charcoal (`#181d27`) pill buttons, soft pastel washes (lavender, mint, powder blue, peach, solar), and whimsical dimensional 3D illustrations floating in generous whitespace.

---

## 🌟 Core Product Features

1. **Geniestudio Design Language**
   - Airy daylight canvas (`#ebf5ff`) and bone-white surfaces (`#fafdff`)
   - Dimensional 3D soft clay illustrations (pet portraits, collar tags, clouds, envelopes, whimsical objects)
   - Strict mid-weight 500 typography (Aeonik display headers with tight `-0.02em` tracking, Geist UI body face)
   - Architectural restraint: borderless 32px cards with natural color-shift depth
   - Filled charcoal (`#181d27`) CTA pill buttons with tight shadow rings
   - Iris blue accent (`#0069e0`) and 90px-radius polaroid gradient hero banner

2. **Landing Page with Centered Hero Stack & Marquee**
   - High-impact display headline with tight tracking and centered CTA action
   - Iris gradient framed banner encasing floating 3D hero pets and scannable tag
   - Continuous horizontal marquee logo/trust ticker
   - "Three steps. One safer way home." 3-column feature cards:
     - `01 — Create` (Owner & Pet, lavender/powder blue accent)
     - `02 — Tag` (Collar with 3D QR tag, mint accent)
     - `03 — Reunite` (Finder scanning collar with phone, green accent)
   - Interactive live collar tag simulator and FAQ accordion rows

3. **Owner Dashboard (`#dashboard`)**
   - Large storybook pet cards showing status (`TAG ACTIVE` or `🔴 LOST`)
   - Quick actions: `View Profile`, `QR Tag`, `Edit`, `Mark as Lost / Found`
   - Real-time **Activity & Tag Scans Feed** showing live scan events and community recovery notifications

4. **Add Pet 5-Step Friendly Wizard (`#add-pet`)**
   - Step 1: Pet's Name
   - Step 2: Species Selection (🐱 Cat, 🐶 Dog, 🐰 Rabbit, 🐹 Other)
   - Step 3: Attributes (Breed, Sex, Age, Color, Distinguishing features)
   - Step 4: Photo upload or storybook avatar presets
   - Step 5: Contact info & privacy toggles (phone visibility, email visibility, SMS message relay)
   - Instant QR code generation upon completion

5. **QR Tag Generation Screen (`#pets/:id/qr`)**
   - Realistic physical pet tag graphic medallion (`🐾 MyPet | QR CODE | LUNA | Scan me`)
   - Scannable, valid client-side generated QR Code
   - Direct actions: **Download QR (PNG)**, **Print Tag** (printable collar cutout format), **Share Profile**, and **Test Finder View**

6. **Public Scanned-Pet Profile (`#p/:petCode`) — *Mobile-First Recovery Screen***
   - **Zero account or app download required** for anyone who finds the pet
   - Large pet photo/avatar, species, sex, age
   - Status badge: `🟢 This pet has an owner` (or `🔴 [Pet Name] is missing` with last-seen date/time/location)
   - Welcoming greeting: *"You've found Luna! Thank you for helping her get home."*
   - Prominent CTAs: **Contact Owner** and **I Found This Pet**
   - Identifying traits: coat, eyes, temperament, medical notes

7. **"I Found This Pet" Recovery Flow**
   - Interactive dialog: finder can provide their name, phone, message, and one-tap current GPS location
   - Automatically logs an alert in the owner's dashboard activity feed

8. **Lost Pet Mode**
   - Toggle pet into Lost Mode with last seen location, date, and time
   - Transforms the dashboard card into a calm, high-visibility alert state
   - Updates the public QR profile to show missing alerts and last-seen instructions

---

## 🚀 Quickstart & Local Running

### Option 1: Using the Python Server (Recommended)
```powershell
python server.py
```
Open your browser at:
- **Homepage:** [http://localhost:8000](http://localhost:8000)
- **Luna's Public QR Profile:** [http://localhost:8000/#p/luna-7x29](http://localhost:8000/#p/luna-7x29)
- **Owner Dashboard:** [http://localhost:8000/#dashboard](http://localhost:8000/#dashboard)

### Option 2: Direct File Open
You can also directly double-click `index.html` in your browser! Everything runs client-side with zero dependencies.

---

## 🧪 Testing the Complete Reunion Flow

1. **As the Finder:**
   - Go to `#p/luna-7x29` (or click "Test Finder Scan" in the header).
   - Click **I Found This Pet**.
   - Fill in your name, phone number, click **📍 Use Current GPS**, and click **Send to Owner**.
2. **As the Owner:**
   - Switch to `#dashboard` (or click "Switch to Owner" in the header).
   - See the incoming recovery alert recorded in the **Tag Scans & Activity** feed!
3. **Test Lost Mode:**
   - On Luna's card in the dashboard, click **🔴 Mark as Lost**.
   - Enter last seen info and submit.
   - Click **View Profile** to see how the public page instantly updates to missing alert status.
   - Return to dashboard and click **✓ Mark Found** to celebrate the reunion!
