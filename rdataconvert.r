#library(zoo)
#library(xts)
library(R.utils)

#returns object from rdata file
#http://stackoverflow.com/a/5577647
loadRDataObj <- function(path) {
 env <- new.env() 
 nm <- load(path, envir = env, verbose = TRUE)[1]
 env[[nm]] 
}

# script is called with scriptname.r --in <inputpath> --out <outputpath>
args <- commandArgs(asValues = TRUE)
inputPath <- args$input
outPath <- args$output

object <- loadRDataObj(inputPath)

# prüfe welcher typ das objekt hat: xts, zoo, oder sp?
# ...

# if xts or zoo
write.csv(object, outPath, row.names=TRUE)

# if sp
# ...








