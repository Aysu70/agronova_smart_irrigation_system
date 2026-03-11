import codecs
path=r'c:\Users\ACER\agronova_smart_irrigation_system-2\start-servers.ps1'
with open(path,'rb') as f:
    lines=f.readlines()
for i,l in enumerate(lines, start=1):
    if b'PowerShell' in l:
        print(i, l)
        print(list(l))
        print(l.decode('utf-8','replace'))
        break
