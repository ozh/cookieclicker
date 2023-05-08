rm -r img
rm -r loc
rm -r snd
mkdir img
mkdir loc
mkdir snd
for f in $(cat _jslist.txt) ; do 
  rm "$f"
done
cd img/
wget --convert-links -O index.html http://orteil.dashnet.org/cookieclicker/img/
grep -v PARENTDIR index.html | grep '\[IMG' | grep -Po 'a href="\K.*?(?=")' | sed 's/\?.*//' > _imglist.txt
wget -N -i _imglist.txt -B http://orteil.dashnet.org/cookieclicker/img/
cd ../snd/
wget --convert-links -O index.html http://orteil.dashnet.org/cookieclicker/snd/
grep -v PARENTDIR index.html | grep '\[SND' | grep -Po 'a href="\K.*?(?=")' | sed 's/\?.*//' > _sndlist.txt
wget -N -i _sndlist.txt -B http://orteil.dashnet.org/cookieclicker/snd/
cd ../loc/
wget --convert-links -O index.html http://orteil.dashnet.org/cookieclicker/loc/
grep -v PARENTDIR index.html | grep '\[TXT' | grep -Po 'a href="\K.*?(?=")' | sed 's/\?.*//' > _loclist.txt
wget -N -i _loclist.txt -B http://orteil.dashnet.org/cookieclicker/loc/
cd ../
wget -O index.html http://orteil.dashnet.org/cookieclicker/
wget -O style.css http://orteil.dashnet.org/cookieclicker/style.css
wget -N -i _jslist.txt -B http://orteil.dashnet.org/cookieclicker/
wget -O grab.txt http://orteil.dashnet.org/patreon/grab.php