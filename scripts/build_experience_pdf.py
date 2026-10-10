from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Table,TableStyle,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
r=Path(__file__).resolve().parents[1];out=r/'assets/documents';out.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('Newsreader',str(r/'assets/fonts/newsreader-regular.ttf')))
ink=HexColor('#233d35');rust=HexColor('#964f37');paper=HexColor('#f5f1e7')
styles={
 'title':ParagraphStyle('title',fontName='Newsreader',fontSize=34,leading=36,textColor=ink,spaceAfter=15),
 'intro':ParagraphStyle('intro',fontName='Newsreader',fontSize=17,leading=22,textColor=ink,spaceAfter=15),
 'h':ParagraphStyle('h',fontName='Newsreader',fontSize=21,leading=25,textColor=ink,spaceBefore=12,spaceAfter=8,keepWithNext=True),
 'sub':ParagraphStyle('sub',fontName='Helvetica-Bold',fontSize=10.5,leading=15,textColor=ink,spaceBefore=10,spaceAfter=4,keepWithNext=True),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9.7,leading=13.5,textColor=ink,spaceAfter=6),
 'small':ParagraphStyle('small',fontName='Helvetica',fontSize=8.7,leading=12.5,textColor=ink,spaceAfter=7),
 'label':ParagraphStyle('label',fontName='Helvetica',fontSize=9,leading=12,textColor=rust,spaceAfter=12)}
story=[]
def add(text,kind='body'):story.append(Paragraph(text,styles[kind]))
def new(title,label):
 if story:story.append(PageBreak())
 add(label.upper(),'label');add(title,'title')
new('Dulten Richard Fromentin','Experience profile / October 2026')
add('Student. Cadet instructor. Working in Brockville, Ontario.','intro')
add('I’m in Grade 12, with interests in political science, international affairs, and entrepreneurship. This profile brings together my cadet service, employment, community involvement, training, and current projects.')
add('Royal Canadian Air Cadets','h')
add('2021-present | Warrant Officer Second Class','sub')
add('I joined Air Cadets in 2021 and have served with 851 Squadron and 661 Lt W F Sharpe Squadron. My experience includes course training, instruction, mentoring younger cadets, parade nights, and senior squadron responsibilities.')
add('I completed CAP 1 in 2022 and CAP 2 in summer 2023, then qualified as a Fitness and Sports Instructor in August 2025. In summer 2026, I served as a Staff Cadet Sergeant. My instructional work includes planning lessons and organising recreational sports: setup, administration, officiating, safety checks, and teardown.')
add('At 661 Squadron’s Annual Ceremonial Review on June 2, 2026, I received the Lord Strathcona Medal, Air Cadet Service Medal, Top Cadet Instructor, and Best Physical Fitness recognition. I also took part in the May 2026 CAF engagement at Petawawa.')
add('Employment','h')
for heading,text in [
 ('Value Village / Community Donation Centre Ambassador / Brockville','April 2026-present; promoted from Sales Clerk in September 2026. I help donors at drop-off, receive and move donated goods, support donation flow, and keep the donation area organised and safe.'),
 ('A&amp;W / Cross-trained team member / Brockville','Experience working across restaurant duties and serving customers.'),
 ('Currah’s Park Store &amp; Grill / Picton / July 2023-October 2024','Front- and back-of-house work in a seasonal hospitality setting.'),
 ('Sunflower Fields / Prince Edward County / June-August 2023','Cashier and ice cream service.')]:add(heading,'sub');add(text)
new('Education, service &amp; sport','Background / Practical training')
add('Education','h')
add('I attended Prince Edward Collegiate Institute for Grades 9 and 10 and Thousand Islands Secondary School from Grade 11. I’m currently in Grade 12. My studies include senior mathematics and science, world studies, manufacturing, welding, and automotive courses.')
add('My Manufacturing Specialist High Skills Major is complete: 18/18 program requirements and 9/9 required credits. Experiential Learning, Reach Ahead, and the Sector-Partnered Experience are complete, including Innovation, Creativity and Entrepreneurship training.')
add('Qualifications &amp; courses','h')
rows=[('Fitness and Sports Instructor - Air Cadets','August 2025'),('Personal Training; Advanced Training in a Technique','October 3, 2025'),('Leadership Skills','December 12, 2025'),('Health and Safety - Basic','February 13, 2026'),('Events Coordination; Project Management; Stress Management Techniques','March 26, 2026'),('CPR/AED, First Aid &amp; Bloodborne Pathogens - Canadian Red Cross','February 2026; listed expiry February 2029')]
t=Table([[Paragraph(a,styles['small']),Paragraph(b,styles['small'])] for a,b in rows],colWidths=[315,176],hAlign='LEFT');t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.5,HexColor('#c9cbbd')),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),15),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),7)]));story.append(t)
add('Community involvement','h')
add('I have 205 completed community-involvement hours. My volunteering includes vendor assistance at Marmora Farmers Market from May to September 2022, dog walking, cadet poppy sales, parades, Remembrance Day events, and helping older community members.')
add('In 2019, I took part in Prince Edward County 4-H’s Maple Syrup and Pizza clubs. I have also participated in Rotary’s Adventure in Citizenship.')
add('Sport &amp; languages','h')
add('I play flanker in rugby and previously rowed with Brockville Rowing Club. My school rugby team earned COSSA silver in 2025. At the 2026 Nancy Storrs Ontario Indoor Rowing Championships, my 2,000-metre result was 7:53.0.')
add('I study French, Spanish, Russian, Arabic, and Mandarin as a hobby. These are languages I’m learning, not claims of fluency.')
new('Recognition &amp; projects','Selected record / Work in progress')
add('Recognition','h')
for h,txt in [('Cadets / 2026','Lord Strathcona Medal; Air Cadet Service Medal; Top Cadet Instructor; Best Physical Fitness; Royal Canadian Legion poppy appreciation.'),('Advocacy / April 2025 / PECI','Two Best Advocate awards and one Best Closing Statement award, earned during Grade 10 mock trial.'),('School, community &amp; sport','Honour Roll (2023-2024); Best All Around Student and E.T.F.O. Award (2023); COSSA rugby silver (2025); theROC Bright Future Award nomination (May 2025). The nomination is recorded separately from award wins.'),('Earlier recognition','Royal Canadian Legion Branch 387 Remembrance Day poem contest placements: second place in 2020 and 2021, third place in 2022. My full online record also includes cadet attendance, fundraising, marksman improvement, commendations, and challenge coins.')]:add(h,'sub');add(txt)
add('Equinox / Edel 665 sailing project','h')
add('I’m working on an approximately 22-foot sailboat. Preparation includes maintenance planning, budgeting, and researching summer mooring around Brockville for 2027. I’ve contacted a marina about availability and seasonal pricing and am working through recurring costs, insurance requirements, and docking documentation. The preparation is ongoing.')
add('Leadership Lab / In development','h')
add('I’m developing a practical, 45-60 minute leadership and teamwork workshop for youth sports teams. Cadet instruction and my own team-sport experience are the starting points. I’m working on the activities and format; the workshop has not yet been delivered.')
add('Supporting records','h')
add('I keep a copy or proof of each award on file, alongside training records, reference letters, lesson plans, and school records. These are not attached to this public profile. Contact me to request supporting material for a specific item.')
add('<link href="https://dulten-editorial-review.dulten.chatgpt.site/experience/" color="#964f37">Full experience record</link>  /  <link href="https://dulten-editorial-review.dulten.chatgpt.site/awards/" color="#964f37">Awards</link>  /  <link href="https://dulten-editorial-review.dulten.chatgpt.site/contact/?topic=Documents" color="#964f37">Request supporting records</link>','small')
def frame(c,d):
 c.setFillColor(paper);c.rect(0,0,595.28,841.89,fill=1,stroke=0);c.setFillColor(ink);c.rect(0,809,595.28,33,fill=1,stroke=0);c.setStrokeColor(rust);c.setLineWidth(.6);c.line(52,45,543,45);c.setFillColor(ink);c.setFont('Helvetica',8);c.drawString(52,30,'DULTEN RICHARD FROMENTIN  /  EXPERIENCE');c.drawRightString(543,30,f'{d.page} / 3')
path=out/'Dulten-Richard-Fromentin-Experience.pdf'
SimpleDocTemplate(str(path),pagesize=(595.28,841.89),rightMargin=52,leftMargin=52,topMargin=51,bottomMargin=56,title='Dulten Richard Fromentin - Experience Profile',author='Dulten Richard Fromentin').build(story,onFirstPage=frame,onLaterPages=frame)
from pypdf import PdfReader
pdf=PdfReader(path);print('Pages:',len(pdf.pages));assert len(pdf.pages)==3
