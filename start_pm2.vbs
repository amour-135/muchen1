Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Lenovo\Documents\trae_projects\muchen"
WshShell.Run """C:\Program Files\nodejs\node.exe"" ""node_modules\pm2\bin\pm2.js"" resurrect", 0, False