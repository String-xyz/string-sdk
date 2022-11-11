provider "aws" {
  region = "us-west-2"
}

terraform {
   required_providers {
    aws = { 
      source = "hashicorp/aws"
      version = "4.0.0"
    }
  }

  backend "s3" {
    encrypt        = true
    key            = "string-sdk.tfstate"
    bucket         = "dev-string-terraform-state"
    dynamodb_table = "dev-string-terraform-state-lock"
    region         = "us-west-2"
  }
}
