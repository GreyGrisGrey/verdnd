first = open('clientOut.js', 'r').read()
second = open('toolcool-color-picker.min.js', 'r').read()

out = open('clientOut.js', 'w')
out.write(first + second)
