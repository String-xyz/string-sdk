resource "aws_s3_bucket" "this" {
  bucket = local.bucket_name
  depends_on = [
    aws_cloudfront_origin_access_identity.this
  ]
}

resource "aws_s3_bucket_policy" "policy" {
  bucket = aws_s3_bucket.this.id
  policy = local.web_policy_config_json
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.this.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
