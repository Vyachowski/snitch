module SiteHealth
  PROTOCOL_REGEX = /^(http|https):\/\//
  URL_REGEX = URI::DEFAULT_PARSER.make_regexp(%w[http https])

  def self.parse_url(input)
    begin
      url_string = input.match(PROTOCOL_REGEX) ? input : "https://#{input}"
      return nil unless url_string.match(URL_REGEX)

      uri = URI.parse(url_string)
      uri.is_a?(URI::HTTP) && uri.host.present? && uri.host.include?(".") ? uri : nil
    rescue URI::BadURIError
      nil
    end
  end

  def self.try_https_protocol(uri)
    return uri if uri.scheme == "https"

    https_uri = uri.dup
    https_uri.scheme = "https"

    begin
      response = Net::HTTP.get_response(https_uri)

      return https_uri if response.is_a?(Net::HTTPResponse)
    rescue StandardError
      # ignore errors
    end

    uri
  end

  def self.server_responds?(uri)
    begin
      response = Net::HTTP.get_response(uri)

      true if response.is_a?(Net::HTTPResponse)
    rescue StandardError
      false
    end
  end
end
