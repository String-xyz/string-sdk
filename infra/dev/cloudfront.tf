resource "aws_cloudfront_origin_access_identity" "this" {
  comment = "${local.env} string sdk origin"
}

resource "aws_cloudfront_distribution" "this" {
  origin {
    domain_name = aws_s3_bucket.this.bucket_regional_domain_name
    origin_id   = local.origin_id
     s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.this.cloudfront_access_identity_path
    }
  }
  aliases = [local.domain]
  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Environment = local.env
    Name        = "${local.env}-string-sdk"
  }

   viewer_certificate {
    ssl_support_method             = "sni-only"
    acm_certificate_arn            = module.web_app.arn
    minimum_protocol_version       = "TLSv1.1_2016"
    cloudfront_default_certificate = false
  }
}
