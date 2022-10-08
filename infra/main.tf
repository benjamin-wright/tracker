resource "google_storage_bucket" "tracker_site" {
  name          = "tracker.ponglehub.co.uk"
  location      = "EU"
  force_destroy = true

  uniform_bucket_level_access = false

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

resource "google_storage_default_object_acl" "tracker_site_acl" {
  bucket      = google_storage_bucket.tracker_site.name
  role_entity = [ "READER:allUsers"]
}

resource "google_dns_record_set" "tracker_site" {
  depends_on = [google_storage_bucket.tracker_site]

  name         = "tracker.ponglehub.co.uk."
  managed_zone = "ponglehub"
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["c.storage.googleapis.com."]
}