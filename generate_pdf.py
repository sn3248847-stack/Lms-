from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

def create_pdf(output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # --- ADVANCED STYLE DEFINITIONS ---
    title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], fontSize=28, textColor=colors.indigo, spaceAfter=30, alignment=1)
    heading_style = ParagraphStyle('HeadingStyle', parent=styles['Heading2'], fontSize=20, textColor=colors.darkviolet, spaceBefore=25, spaceAfter=12, borderPadding=5, borderLeft=True)
    sub_heading_style = ParagraphStyle('SubHeadingStyle', parent=styles['Heading3'], fontSize=15, textColor=colors.darkblue, spaceBefore=15, spaceAfter=8)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=11, leading=15)
    code_block_style = ParagraphStyle('CodeBlockStyle', parent=styles['Normal'], fontName='Courier', fontSize=9, leftIndent=20, rightIndent=20, textColor=colors.black, backColor=colors.whitesmoke, borderPadding=10, leading=12)
    label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=10, textColor=colors.grey, italic=True)
    note_style = ParagraphStyle('NoteStyle', parent=styles['Normal'], fontSize=10, textColor=colors.darkgreen, italic=True)

    # --- PAGE 1: THE BIG PICTURE ---
    story.append(Paragraph("LMS Project: Exhaustive Technical Documentation", title_style))
    story.append(Paragraph("A complete line-by-line and file-by-file logic breakdown for presentation.", body_style))
    story.append(Spacer(1, 40))

    story.append(Paragraph("Section 1: The Core Backend (Django)", heading_style))
    
    # settings.py EXHAUSTIVE
    story.append(Paragraph("File: lms_backend/settings.py (Global Configuration)", sub_heading_style))
    story.append(Paragraph("This is the 'Operating System' of your backend. It controls external connections and internal apps.", body_style))
    story.append(Paragraph("""
    • <b>INSTALLED_APPS:</b> Includes 'rest_framework' (the engine for API), 'corsheaders' (allows the website to connect), and our custom apps 'users' and 'courses'.<br/>
    • <b>AUTH_USER_MODEL:</b> This points to 'users.User'. We tells Django 'do not use your default user, use MY custom one with roles'.<br/>
    • <b>REST_FRAMEWORK API Logic:</b> We set 'JWTAuthentication' as the default. This ensures every API request requires a secure 8-character+ token.<br/>
    • <b>CORS_ALLOW_ALL_ORIGINS:</b> This allows our Frontend (JavaScript) to fetch data from our Backend (Python) without security blocks.
    """, body_style))

    story.append(PageBreak())

    # --- PAGE 2: USER & AUTHENTICATION (THE SECURITY) ---
    story.append(Paragraph("Section 2: Users & Authentication App", heading_style))

    # models.py
    story.append(Paragraph("File: users/models.py (Identity Logic)", sub_heading_style))
    story.append(Paragraph("<b>Code Detail:</b>", body_style))
    story.append(Paragraph("""
    <b>class UserRole(TextChoices):</b> Defines three choices: ADMIN, INSTRUCTOR, STUDENT. This is hard-coded into the database for high performance.<br/>
    <b>class User(AbstractUser):</b> We inherit from Django's secure user system and add the <code>role</code> field.
    """, code_block_style))

    # views.py
    story.append(Paragraph("File: users/views.py (The Gatekeeper)", sub_heading_style))
    story.append(Paragraph("""
    • <b>RegisterView:</b> Takes data (email/username) and uses a <code>create()</code> function to save the user. If they are a student, it defaults their role.<br/>
    • <b>CustomTokenView:</b> When a user logs in, this doesn't just check the password; it manually attaches the <b>Role</b> and <b>Username</b> to the response so the Frontend knows which dashboard to show.
    """, body_style))

    # Serializers
    story.append(Paragraph("File: users/serializers.py (Safety Translators)", sub_heading_style))
    story.append(Paragraph("<b>The 'Magic' of Auto-Passwords:</b>", body_style))
    story.append(Paragraph("""
    def create(self, validated_data):<br/>
    &nbsp;&nbsp;if not password:<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;password = ''.join(random.choices(string.ascii + digits, k=8))<br/>
    &nbsp;&nbsp;user = User.objects.create_user(...)<br/>
    &nbsp;&nbsp;return user
    """, code_block_style))
    story.append(Paragraph("<b>Explain to Teacher:</b> <i>'If an admin creates a teacher account but leaves the password blank, my code automatically generates a secure 8-character random password.'</i>", note_style))

    story.append(PageBreak())

    # --- PAGE 3: COURSES & LMS FEATURES (THE DATA) ---
    story.append(Paragraph("Section 3: Courses & LMS Logic", heading_style))

    # models.py EXAHAUSTIVE
    story.append(Paragraph("File: courses/models.py (The Knowledge Base)", sub_heading_style))
    story.append(Paragraph("<b>The Linking Tree:</b>", body_style))
    story.append(Paragraph("""
    • <b>Course:</b> The root object. Links to an Instructor User.<br/>
    • <b>Enrollment:</b> Links a STUDENT to a COURSE. It also has a 'progress' field (integer 0-100) to track how much they've learned.<br/>
    • <b>LiveClass:</b> Contains <code>meeting_link</code> and <code>start_time</code>. This allows teachers to schedule Zoom calls directly.
    """, body_style))

    # views.py (THE BIG ONE)
    story.append(Paragraph("File: courses/views.py (Data Filtering)", sub_heading_style))
    story.append(Paragraph("<b>The 'Privacy' Logic in the Code:</b>", body_style))
    story.append(Paragraph("""
    def get_queryset(self):<br/>
    &nbsp;&nbsp;user = self.request.user<br/>
    &nbsp;&nbsp;if user.role == 'INSTRUCTOR':<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;return Course.objects.filter(instructor=user)<br/>
    &nbsp;&nbsp;if user.role == 'STUDENT':<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;return Course.objects.all() # Or enrolled courses
    """, code_block_style))
    story.append(Paragraph("<b>Explain to Teacher:</b> <i>'I wrote custom logic so that teachers can only see and edit THEIR courses, while students can browse all available learning material.'</i>", note_style))

    story.append(PageBreak())

    # --- PAGE 4: THE API DESIGN (THE COMMUNICATIONS) ---
    story.append(Paragraph("Section 4: The API Interface (Endpoints)", heading_style))
    story.append(Paragraph("The Backend exposes these 'Endpoints' that the Frontend uses to get data.", body_style))

    api_table = [
        ["Method", "Endpoint", "Purpose"],
        ["POST", "/api/register/", "Create a new Student account."],
        ["POST", "/api/token/", "Login and get a JWT Secure Token."],
        ["GET", "/api/courses/", "Fetch the list of all classes."],
        ["POST", "/api/courses/", "Allow Instructors to create new courses."],
        ["GET", "/api/live-classes/", "Get links to scheduled Zoom meetings."]
    ]
    t_api = Table(api_table, colWidths=[60, 180, 260])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.indigo),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 8)
    ]))
    story.append(t_api)
    story.append(Spacer(1, 20))
    story.append(Paragraph("<b>Format:</b> All data is sent as <b>JSON</b>. For example, a course looks like this:", body_style))
    story.append(Paragraph("""
    {<br/>
    &nbsp;&nbsp;"id": 1,<br/>
    &nbsp;&nbsp;"title": "Intro to Python",<br/>
    &nbsp;&nbsp;"instructor": "Dr. Smith"<br/>
    }
    """, code_block_style))

    story.append(PageBreak())

    # --- PAGE 5: FRONTEND ARCHITECTURE (THE UI) ---
    story.append(Paragraph("Section 5: Frontend Design (Next.js)", heading_style))

    # App Router
    story.append(Paragraph("File Structure: /src/app (Dynamic Routing)", sub_heading_style))
    story.append(Paragraph("I used the **Next.js App Router** for speed and SEO optimization.", body_style))
    story.append(Paragraph("""
    • <b>/login/page.tsx:</b> The Entry Point. It handles state for the username/password fields.<br/>
    • <b>/student-dashboard/page.tsx:</b> Uses 'Fetch' to call the backend and map over the courses to show them in small cards.<br/>
    • <b>layout.tsx:</b> The Wrapper. It defines the global fonts and colors using **Tailwind CSS**.
    """, body_style))

    # Logic Walkthrough
    story.append(Paragraph("The Data Connection Logic (How it works):", sub_heading_style))
    story.append(Paragraph("""
    <b>1. handleLogin():</b> Function that runs when you click 'Login'. It uses <code>fetch()</code> to send a request to Django.<br/>
    <b>2. js-cookie:</b> If Backend returns 'Success', the browser saves the token in a <b>Cookie</b>. This allows you to stay logged in even if you refresh the page.<br/>
    <b>3. router.push():</b> Instantly navigates to the specific dashboard based on the <code>role</code> returned by the API.
    """, code_block_style))

    story.append(PageBreak())

    # --- PAGE 6: ADVANCED CONCEPTS (FOR EXTRA MARKS) ---
    story.append(Paragraph("Section 6: Advanced System Features", heading_style))
    
    adv_data = [
        ["Concept", "What I used", "Why?"],
        ["Auth", "JWT (JSON Web Tokens)", "More secure than standard sessions."],
        ["Styling", "Tailwind CSS", "Makes the UI responsive and modern."],
        ["Icons", "Lucide React", "Lightweight, vector-based illustrations."],
        ["Efficiency", "Prefetch Related", "Reduces database queries (faster app)."]
    ]
    t_adv = Table(adv_data, colWidths=[100, 150, 250])
    t_adv.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.darkviolet),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('GRID', (0,0), (-1,-1), 1, colors.grey),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(t_adv)

    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>Conclusion Summary for Teacher:</b>", sub_heading_style))
    story.append(Paragraph("<i>'This project demonstrates a full-stack, industry-standard implementation. It solves real-world problems like user privacy (Role-Based Access) and scheduling (Live Classes) using the latest technologies available in web development today.'</i>", body_style))

    doc.build(story)

if __name__ == "__main__":
    create_pdf("LMS_Definitive_Code_Guide.pdf")
    print("Definitive PDF Created Successfully.")

