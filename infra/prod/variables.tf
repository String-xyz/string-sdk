locals {
  env         = "prod"
  bucket_name = "cdn.string-api.xyz"
  sub_domain  = "cdn"
  origin_id   = "string-sdk"
  domain      = "cdn.string-api.xyz"
  
  web_policy_config_json = jsonencode({
    "Version" : "2008-10-17",
    "Statement" : [
      {
        "Sid" : "AllowReadFromCloudfront",
        "Effect" : "Allow",
        "Principal" : {
          "AWS" : "${aws_cloudfront_origin_access_identity.this.iam_arn}"
        },
        "Action" : "s3:GetObject",
        "Resource" : "arn:aws:s3:::${local.bucket_name}/*"
      }
    ]
    }
  )
}
