## INSTALL LATEXML on UBuntuneufnsjdkflö

# LaTeXML deps
apt-get install -y \
libarchive-zip-perl libfile-which-perl libimage-size-perl  \
libio-string-perl libjson-xs-perl libparse-recdescent-perl \
liburi-perl libuuid-tiny-perl libwww-perl                  \
libxml2 libxml-libxml-perl libxslt1.1 libxml-libxslt-perl  \
texlive-full imagemagick libimage-magick-perl


# download and compile LaTeXML 0.8.1
wget http://dlmf.nist.gov/LaTeXML/releases/LaTeXML-0.8.1.tar.gz
tar -xzf LaTeXML-0.8.1.tar.gz
cd LaTeXML-0.8.1/
perl Makefile.PL
make
make install
cd ..
rm -rf LaTeXML-0.8.1*