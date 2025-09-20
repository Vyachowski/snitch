require "test_helper"

class SiteHealthTest < ActiveSupport::TestCase
  setup do
    @input = "google.com"
    @http_input = "http://google.com"
    @https_input = "https://google.com"
    @valid_input_without_ssl = "http://grandwholeuniquelight.neverssl.com/online/"
    @invalid_input = "notasite"

    @valid_url = URI.parse "https://google.com"
  end

  test "valid url parsing" do
    assert SiteHealth.parse_url(@input).is_a?(URI::Generic)
    assert SiteHealth.parse_url(@http_input).is_a?(URI::HTTP)
    assert SiteHealth.parse_url(@https_input).is_a?(URI::HTTPS)

    assert SiteHealth.parse_url(@invalid_input).nil?
  end

  test "valid protocol switching" do
    http_uri = SiteHealth.parse_url(@http_input)
    https_based_uri = SiteHealth.parse_url(@https_input)
    https_uri = SiteHealth.try_https_protocol(http_uri)

    http_only_uri = SiteHealth.parse_url(@valid_input_without_ssl)
    http_only_uri_unchanged = SiteHealth.try_https_protocol(http_only_uri)
    https_only_uri = SiteHealth.try_https_protocol(https_based_uri)

    assert https_uri.scheme == "https"
    assert https_only_uri.scheme == "https"
    assert http_only_uri_unchanged.scheme == "http"
  end
end
