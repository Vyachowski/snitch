module SiteHealth
  PROTOCOL_REGEX = /^(http|https):\/\//

  def parse_url(input)
    begin
      url_string = input.match(PROTOCOL_REGEX) ? input : "https://#{input}"

      URI.parse(url_string)
    rescue URI::BadURIError
      nil
    end
  end

  def try_https_protocol(uri)
    return uri if uri.scheme == "https"

    https_uri = uri.dup
    https_uri.scheme = "https"

    begin
      response = Net::HTTP.get_response(https_uri)

      return https_uri if response.is_a?(Net::HTTPSuccess) || response.is_a?(Net::HTTPRedirection)
    rescue StandardError
      # ignore errors
    end

    uri
  end

  def server_responds?(uri)
    begin
      response = Net::HTTP.get_response(uri)

      true if response.is_a?(Net::HTTPResponse)
    rescue StandardError
      false
    end
  end
end
