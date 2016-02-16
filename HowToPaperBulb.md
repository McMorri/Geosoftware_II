# How to use PaperBulb

### View Papers

You can view papers by clicking on a paper listed in the Paper-List on the right side of the page. (on mobile devices or other devices with a low display resolution the Paper-List might be displayed in the bottom of the page)

### Login

  - click the Options Button on the upper right side of the webpage
  - click on "Github-Login"
  - login with your Github Account. If you don't have a Github-Account yet you can go to [GitHub.com] to create an Account for free.
  
### How to upload a new publication

  - click the Options Button on the upper right side of the webpage
  - click on "New Publication"
  - Enter all necessary information of your publication
    * **publicationname:** the title of your publication
    * **authorname:** your name
    * **TeX file:** Paperbulb uses LaTeX as a format for publications. Choose your publication in .tex format
    * **Other files:** upload all other files here. This could include graphics or pictures that you want to display in your LaTex file or even data for interactive figures.
  - Click "Upload". The Upload process may take some time. 

### interactive figures

PaperBulb supports numerous different file formats for interactive elements within your paper. The position of the interactive element is defined by a tag that you write at the position in the LaTeX document where the interactive element should be displayed:

>!-IAE type=timeseries dataset=fig-8.rdata !-IAE

- **!-IAE**: defines the start and the end of the tag
- **type**: defines the type of the interactive element. Possible types are:
    * timeseries
    * map
- **dataset**: name of the file that will be shown at the position of this tag. Possible file formats are:
    * rdata (xts objects)
    * JSON
    * TIFF
    * GeoTIFF

### Download

You can download the paper that you are currently viewing by clicking on "Options" and then "Download". 

   [GitHub.com]: <https://github.com>
