Set WshShell = CreateObject("WScript.Shell")
' El numero 0 al final significa: OCULTAR VENTANA
' Chr(34) son las comillas para manejar espacios en la ruta
WshShell.Run chr(34) & "D:\PROYECTOS REACT\pos-updated\sistema.bat" & chr(34), 0
Set WshShell = Nothing