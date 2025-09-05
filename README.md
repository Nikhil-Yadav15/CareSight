# 👀✨ CareSight – Eye-Controlled Connected Care ✨👀

> **CareSight** is a hospital-focused web platform paired with a patient mobile app that empowers ventilated and immobile patients to communicate using only eye movements.  
> The ecosystem includes **dashboards for admins & nurses**, **status access for guardians**, and **entertainment features for patients** — ensuring independence, faster response times, and peace of mind for families.  

---

## 🌟 Key Features

### 🏥 Admin Dashboard
- Assign patients dynamically to available nurses  
- Add & manage nurse accounts with ease  
- Centralized control for workload balancing  

### 👩‍⚕ Nurse Dashboard
- Access detailed patient information (conditions, medicines, dosage)  
- Receive **real-time patient alerts** triggered directly by eye control  
- Track medication schedules and assignments seamlessly  

### 👨‍👩‍👧 Guardian Access
- Family members/guardians can securely log in  
- View patient’s current status, progress, and alerts  
- Stay connected and reassured  

### 📱 Patient App
- Communicate hands-free using **face & eye tracking**  
- Entertainment features 🎵🎬 (music, videos, calming visuals)  
- Send alerts & requests directly to nurses  
- Medication reminders and wellbeing support  

---

## 🗄️ Tech Stack

- **Frontend (Website):** [Next.js](https://nextjs.org/)  
- **Backend & APIs:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)  
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime + Auth)  
- **Face Tracking:** [face-api.js](https://github.com/justadudewhohacks/face-api.js) (eye gaze + blink detection)  


---

## 📊 Database Schema (Simplified)

```mermaid
erDiagram
    HOSPITAL {
      uuid id PK
      text name
      text address
      text email
      text password
      text phone_number
      array nurse_ids
      array patient_ids
      timestamptz createdat
      timestamptz updatedat
    }

    NURSE {
      uuid id PK
      text name
      text email
      bigint phone_number
      text password
      uuid hospital_id FK "→ hospital.id"
      array patient_ids
      array alert_ids
      timestamptz shift
      timestamptz createdat
      timestamptz updatedat
    }

    PATIENTS {
      uuid id PK
      text name
      int age
      text gender
      text room
      text diagnosis
      text email
      text password
      bigint phone_number
      text photo_url
      jsonb family
      text last_alert
      uuid medications_id FK "→ medication.id"
      uuid hospital_id FK "→ hospital.id"
      array assigned_nurse_ids
      user_defined preferred_lang
      timestamptz createdat
      timestamptz updatedat
    }

    MEDICATION {
      uuid id PK
      text name
      jsonb dosage
      uuid patient_id
      timestamptz createdat
      timestamptz updatedat
    }

    ALERT {
      uuid id PK
      text name
      uuid patient_id FK "→ patients.id"
      uuid nurse_id FK "→ nurse.id"
      uuid hospital_id FK "→ hospital.id"
      user_defined status
      user_defined seen
      timestamptz createdat
      timestamptz updatedat
    }

    ENTERTAINMENT {
      text type
      text title
      text genre
      text artist
      interval duration
      text poster_url
      text content_url
      timestamptz createdat
      timestamptz updatedat
    }

    %% Relationships
    HOSPITAL ||--o{ NURSE : employs
    HOSPITAL ||--o{ PATIENTS : hosts
    NURSE ||--o{ ALERT : responds_to
    NURSE ||--o{ PATIENTS : assigned_to
    PATIENTS ||--o{ ALERT : triggers
    PATIENTS ||--o{ MEDICATION : prescribed
