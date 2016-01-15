library(zoo)
library(xts)
library(sp)
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
outputPath <- args$output

object <- loadRDataObj(inputPath)

# check object type: xts? zoo? sp?
classes <- class(object)
if("ts" %in% classes){
	if(xtsible(object)){
		#todo xts conversion
	}else{
		write.zoo(object, file=outputPath, sep=",",row.names=FALSE)
	}
}else{
	#todo sp conversion
} 






