🏗️ Learn Math - מערכת למידה אדפטיבית לילדים
Learn Math היא פלטפורמת Web אינטראקטיבית ומתקדמת ללימוד מתמטיקה, המשלבת אלמנטים של Gamification עם מנוע גנרטיבי ליצירת תרגילים מותאמים אישית. הפרויקט נבנה בדגש על חוויית משתמש (UX) מונגשת, לוגיקה מערכתית וניתוח נתונים.

🔗 לכניסה לאתר החי https://learn-math-eight.vercel.app/parent
✨ פיצ'רים עיקריים
מנוע תרגילים דינמי (Algorithm-based): יצירת תרגילים בזמן אמת על בסיס אילוצים (Constraints) המוגדרים על ידי המשתמש.

מערכת תגמולים (Economy System): מנגנון צבירת מטבעות, בונוסים על רצפי הצלחות (Combos) וחנות פרסים וירטואלית.

מרכז בקרה להורים (Parent Dashboard):

Configuration Management: הגדרת רמות קושי, טווחי מספרים וסוגי פעולות חשבון.

Data Visualization: ניתוח התקדמות הילד באמצעות גרף מגמות (Trend Analysis) המציג ביצועים לאורך זמן.

Security: מנגנון אימות לקוח (Client-side Auth) להגנה על הגדרות המערכת.

עיצוב רספונסיבי ונגיש: ממשק High-Contrast המותאם לעבודה ממכשירים ניידים בתנאי תאורה משתנים.

🛠️ ארכיטקטורה וטכנולוגיות
Frontend Framework: Next.js 14 (App Router) לכתיבת קוד מודולרי וביצועים אופטימליים.

State Management: ניהול מצב גלובלי באמצעות React Context API.

Data Persistence: שימוש באסטרטגיית Client-side Persistence (LocalStorage) לביצועים מהירים (Zero Latency) ושמירה על פרטיות המשתמש (Privacy by Design).

UI & Animations: שימוש ב-Tailwind CSS לעיצוב נקי וב-Framer Motion לאנימציות חווייתיות.

Analytics: הטמעת Vercel Analytics למדידת Retention וניטור תנועת משתמשים.

CI/CD: פריסה אוטומטית (Automated Deployment) בתשתית הענן של Vercel.

🧠 הצצה לאלגוריתמיקה (Core Logic)
המערכת מיישמת מספר עקרונות הנדסיים חשובים:

Generator Pattern: המערכת אינה משתמשת בבנק שאלות סטטי. במקום זאת, היא מריצה אלגוריתם המייצר תרגילים Stateless-ית לפי חוקיות מתמטית (למשל: מניעת תוצאות שליליות בחיסור או חילוק עם שארית).

Distractors Algorithm: יצירת מסיחים (תשובות שגויות) המבוססים על רעש סטטיסטי (Offset) סביב התוצאה הנכונה, כדי לשמור על רמת אתגר הגיונית.

Data Aggregation: לוגיקת צבירת נתונים המבצעת סינון ומיון של אירועי הצלחה לטובת ויזואליזציה בלוח הבקרה.

🚀 הרצה מקומית
# שכפול המאגר
git clone https://github.com/YOUR_USERNAME/learn-math.git](https://github.com/ITammyDinavetsky/learn-math.git

# התקנת תלויות
npm install

# הרצה במצב פיתוח
npm run dev
