# PaperBulb

PaperBulb is a web based publication platform, which enables researchers and developers to show their research findings to the world. 
The following documents describes all at the platform available functionality. The different implemented functions are numbered for a better overview.

# System Requirements:

The developed software is designed to be run on Linux based Servers only. While testing and developing Ubuntu 14.04.3 LTS and Ubuntu Server 14.04.3 LTS was used. We can only ensure functionality on these systems. 

# Installation-Guide:

1.	Install MongoDB (Version 3.0) 
A installation guide can be found here:
https://docs.mongodb.org/v3.0/tutorial/install-mongodb-on-ubuntu/
Watch out to choose the right version for your operating system
2.	Install Nodejs
The following commands to install Nodejs can be found here:
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions. 
We recommend at least version 4.x, which can be installed with the following commands:
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
3.	Install LaTeXML (Version 0.8.1)
A full installation guide can be found here:
http://dlmf.nist.gov/LaTeXML/get.html
In order to simplify the installation you can use a script which can be found at the Github-Repository of this project. Run it as root in your project directory:
LINK

4.	Install R 
A full installation guide for R can be found at:
https://www.digitalocean.com/community/tutorials/how-to-set-up-r-on-ubuntu-14-04
Follow the steps on the website and pay special attention to install packages as root to prevent possible errors in usage.	

5.	Install R Packages
Install the R Packages “xts”, “zoo”, “sp” and “R.utils”
After you installed R you can start it by typing “R” in the command line. Now you can install the packages by typing “install.packages(“xts”, “zoo”, “sp”, “R.utils”)” in the R shell. 

6.	Install Bower 
The package manager can be installed by the following command
sudo npm install -g bower

7.	To install the necessary dependencies run the following commands in the project directory
sudo npm install
sudo bower install

8.	YAY, you successfully installed all the necessary software. There are two steps left before you have a completely running publication platform.
-	Start MongoDB
-	Start the server running the following command in main directory of the project 
node server.js 


The Server Port is set to “8080”. 
