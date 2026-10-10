"""Build the downloadable profile from the same reviewed data as the website."""
from pathlib import Path
import json,html,datetime
from reportlab.platypus import SimpleDocTemplate,Paragraph,Table,TableStyle,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1];D=json.loads((ROOT/'data/profile.json').read_text())
OUT=ROOT/'assets/documents/Dulten-Richard-Fromentin-Experience.pdf'
pdfmetrics.registerFont(TTFont('Newsreader',str(ROOT/'assets/fonts/newsreader-regular.ttf')))
ink=HexColor('#18252c');muted=HexColor('#586872');paper=HexColor('#f3f1ea');blue=HexColor('#34586b')
styles={
 'title':ParagraphStyle('title',fontName='Newsreader',fontSize=34,leading=36,textColor=ink,spaceAfter=15),
 'intro':ParagraphStyle('intro',fontName='Newsreader',fontSize=16,leading=21,textColor=ink,spaceAfter=15),
 'h':ParagraphStyle('h',fontName='Newsreader',fontSize=21,leading=25,textColor=ink,spaceBefore=12,spaceAfter=8,keepWithNext=True),
 'sub':ParagraphStyle('sub',fontName='Helvetica-Bold',fontSize=10,leading=14,textColor=ink,spaceBefore=9,spaceAfter=4,keepWithNext=True),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9.5,leading=13.4,textColor=ink,spaceAfter=6),
 'small':ParagraphStyle('small',fontName='Helvetica',fontSize=8.5,leading=12,textColor=muted,spaceAfter=6),
 'label':ParagraphStyle('label',fontName='Helvetica',fontSize=8,leading=11,textColor=blue,spaceAfter=12)}
def clean(t):return html.escape(t.replace('—','-').replace('–','-').replace('’',"'").replace('“','"').replace('”','"'))
story=[]
def add(t,kind='body',raw=False):story.append(Paragraph(t if raw else clean(t),styles[kind]))
def new(t,label):
 if story:story.append(PageBreak())
 add(label.upper(),'label');add(t,'title')
new(D['name'],'Experience profile / '+D['updated'])
add('Student. Cadet instructor. Working in Brockville, Ontario.','intro')
add(D['intro'])
add('Royal Canadian Air Cadets','h')
current=D['ranks'][-1];joined=D['ranks'][0]
add('Joined '+datetime.date.fromisoformat(joined['date']).strftime('%B %d, %Y').replace(' 0',' ')+' | '+current['title']+' since '+datetime.date.fromisoformat(current['date']).strftime('%B %d, %Y').replace(' 0',' '),'sub')
add('I have served with 851 Prince Edward Squadron and 661 Lt W F Sharpe Squadron. My experience includes instruction, mentoring junior cadets, ceremonial activities, community service, and senior squadron responsibilities.')
add('I completed CAP 1 in 2022 and CAP 2 in summer 2023, then qualified as a Fitness and Sports Instructor on August 17, 2025. In summer 2026, I served as a Staff Cadet Sergeant at Blackdown, with platoon leadership and company support across training, administration, logistics, and cadet welfare.')
add('Employment','h')
for x in D['employment']:
 add(x['company']+' / '+x['role'],'sub');add(x['date']+' | '+x['location'],'small');add(x['body'])
new('Education, service & sport','Background / Practical training')
for x in D['education']:
 add(x['school'],'sub');add(x['period']+' | '+x['status'],'small');add(x['body'])
add('Qualifications & courses','h')
rows=[]
for x in D['training']:
 rows.append([Paragraph(clean(x['name']+' - '+x['issuer']),styles['small']),Paragraph(clean(x['date']+(' | Listed expiry '+x['expiry'] if x.get('expiry') else '')),styles['small'])])
t=Table(rows,colWidths=[320,171],hAlign='LEFT');t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,HexColor('#cbd0cb')),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),14),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),6)]));story.append(t)
add('Community involvement','h');add(str(D['communityHours'])+' completed hours. My volunteering includes vendor assistance at Marmora Farmers Market (May-September 2022), dog walking, cadet poppy sales, parades, Remembrance Day events, and helping older community members.')
add('In 2019, I participated in Prince Edward County 4-H Maple Syrup and Pizza clubs. I have also participated in Rotary’s Adventure in Citizenship.')
add('Sport & languages','h');add('I play flanker in rugby and previously rowed with Brockville Rowing Club. My school team earned COSSA rugby silver in 2025. At the 2026 Nancy Storrs Ontario Indoor Rowing Championships, my 2,000-metre result was 7:53.0.')
add('I study French, Spanish, Russian, Arabic, and Mandarin as a hobby.')
new('Recognition & projects','Selected record / Work in progress')
for category,ids in [('Cadets / June 2026',['strathcona','service','instructor','fitness','legion']),('Mock trial / April 2025 / PECI',['advocate','closing']),('School, community & sport',['honour-roll','cossa-rugby','nomination'])]:
 add(category,'sub')
 selected=[x for x in D['awards'] if x['id'] in ids]
 add('; '.join(x['title']+(' (two awards)' if x['id']=='advocate' else ' (nomination)' if x['id']=='nomination' else '') for x in selected)+'.')
add('Earlier recognition includes Best All Around Student and the E.T.F.O. Award (2023), Legion poem contest placements in 2020, 2021, and 2022, and cadet attendance, fundraising, marksman improvement, commendations, and four challenge coins. The full year-by-year record is on my website.')
for p in D['projects']:
 add(p['name']+' / '+p['type'],'h');add(p['status'],'small');add(p['body'])
 if p['id']=='equinox':add('I have researched mooring around Brockville and contacted a marina about 2027 availability, pricing, insurance requirements, and docking documentation. Preparation remains ongoing.')
 else:add('The workshop has not yet been delivered. The first goal is a local pilot and useful feedback on the format.')
add('Supporting records','h');add('I keep a copy or proof of each award on file, alongside training records, reference letters, lesson plans, and school records. Contact me to request supporting material for a specific item.')
add('<link href="mailto:'+D['email']+'" color="#34586b">'+D['email']+'</link> | <link href="https://www.linkedin.com/in/dultenrpfromentin/" color="#34586b">LinkedIn</link>','small',True)
def frame(c,d):
 c.setFillColor(paper);c.rect(0,0,595.28,841.89,fill=1,stroke=0);c.setFillColor(ink);c.rect(0,817,595.28,25,fill=1,stroke=0);c.setStrokeColor(HexColor('#afbbb9'));c.line(52,45,543,45);c.setFont('Helvetica',8);c.drawString(52,30,'DULTEN RICHARD FROMENTIN / EXPERIENCE');c.drawRightString(543,30,str(d.page)+' / 3')
SimpleDocTemplate(str(OUT),pagesize=(595.28,841.89),rightMargin=52,leftMargin=52,topMargin=49,bottomMargin=55,title=D['name']+' - Experience Profile',author=D['name']).build(story,onFirstPage=frame,onLaterPages=frame)
pdf=PdfReader(OUT);assert len(pdf.pages)==3, len(pdf.pages)
text='\n'.join(p.extract_text() for p in pdf.pages)
for required in ['November 11, 2025','October 2025','February 2026','February 2027 expected','June 2025','April 2025','205']:
 assert required in text,required
print('Three-page profile built; reconciled dates verified.')
