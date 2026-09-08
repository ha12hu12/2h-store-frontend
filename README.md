# 2h-store — الفرونت اند

React + Vite + Tailwind. مبني فوق الباك اند تبع مشروع `2h-store` (FastAPI).

## التشغيل محليًا

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` بملف `.env` لازم يشاور على رابط الباك اند (افتراضيًا `http://localhost:8000` للتطوير المحلي).

## النشر (Vercel)

1. ارفع هذا المجلد لمستودع GitHub منفصل (`2h-store-frontend`)
2. بـ Vercel: New Project → اختر المستودع → يكتشف Vite تلقائيًا
3. بإعدادات المشروع على Vercel → Environment Variables، ضيف:
   ```
   VITE_API_URL=<رابط الباك اند على Railway بعد نشره>
   ```
4. Deploy

## ⚠️ تعديلين صغيرين مطلوبين بالباك اند قبل ما يشتغل كل شي

الفرونت اند مبني بالكامل على الـ endpoints الموجودة عندك، لكن فيه معلومتين ناقصتين من الـ responses الحالية والفرونت اند محتاجهم ضروري. بدونهم الموقع يشتغل، لكن الرصيد ما يبين وزر الشراء ما يشتغل.

### 1) رصيد المستخدم واسمه — endpoint جديد

ما فيه أي مسار حاليًا يرجع بيانات المستخدم المسجل دخوله (اسمه، رصيده) — بس `/login` يرجع التوكن، وما فيه GET للبروفايل. ضيف بـ `app/routers/user.py`:

```python
@router.get("/users/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
```

وضيف `money: float` لـ `schemas.UserOut` عشان يرجع فعليًا بالـ response:

```python
class UserOut(BaseModel):
    id: int
    username: str
    money: float
    model_config = ConfigDict(from_attributes=True)
```

### 2) `id` المنتج مفقود من الـ response

`ProductOut` و`MyProductOut` ما فيهم `id` — والفرونت اند يحتاجه عشان يعرف أي منتج بالضبط يشتري (`POST /carts/{id}`). ضيف السطر بـ `app/schemas.py`:

```python
class ProductOut(BaseModel):
    id: int          # ← جديد
    product_name: str
    description: str
    amount: int
    image_url: Optional[str] = None
    price: float
    owner: UserOut

class MyProductOut(BaseModel):
    id: int           # ← جديد
    product_name: str
    description: Optional[str] = "there is no description"
    amount: int
    price: float       # ← جديد، عشان تقدر تشوف سعر منتجك بصفحة "منتجاتي"
    image_url: Optional[str] = None
```

ما فيه أي تعديل على الـ models أو المنطق — الأعمدة أصلاً موجودة بقاعدة البيانات، بس ناقصة من الـ schema اللي يتحول لـ JSON.

## ملاحظة صغيرة (مو عاجلة)

تحديث وحذف المنتج (`PATCH`/`DELETE /products/{name}`) والبحث يعتمدون على اسم المنتج بدل الـ `id` — وهذا قرار منطقي فعليًا، لأن التاجر هو اللي يتعامل مع الاسم مباشرة (يعرفه ويتذكره)، بعكس الـ `id` اللي ما له معنى بالنسبة له. بس بما إن اسم المنتج مو unique بقاعدة البيانات (لاحظنا هذا وقت الاختبارات — منتجين لشخصين مختلفين ممكن يكون لهم نفس الاسم)، فيه احتمال ضعيف يصير تعارض لو صار تطابق أسماء بين تاجرين. مو خطر أمني (فحص الملكية موجود ويمنع أي تعديل فعلي على منتج مو لك)، بس ممكن نادرًا يرجع خطأ "403" غير متوقع لصاحب المنتج الحقيقي لو تاجر ثاني سبقه بنفس الاسم بالجدول. لو حبيت تصلحها مستقبلاً بدون ما تغيّر تجربة التاجر، تقدر تخلي التحقق الأول يفلتر بـ `owner_id == current_user.id` **مع** `product_name == name` مع بعض (مو بس الاسم لحاله) — بهذا الشكل تبقى تستخدم الاسم زي ما هو، بس تضمن دايمًا توصل لمنتجك أنت تحديدًا حتى لو تاجر ثاني عنده نفس الاسم.
