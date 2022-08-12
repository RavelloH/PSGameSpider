from PIL import Image
import os


os.makedirs('min-recent-en',exist_ok=True)
for j in os.listdir('min-recent-en/'):
    os.remove('min-recent-en/'+j)
def smallPic():
    for i in os.listdir('recent-en/'):
        filename = "recent-en/"+i
        print(filename)
        im = Image.open(filename)
        print(im.format, im.size, im.mode, filename)
        im.thumbnail((256, (im.size[1] * im.size[0] / 256)))
        savepath = "min-recent-en/"+i
        im.save(savepath, 'JPEG')
        
if __name__ == '__main__':
    smallPic()
