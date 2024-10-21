from urllib.parse import urlparse


def is_same_page(url1, url2):
    """Checks if two URLs belong to the same page."""

    # Parse the URLs
    parsed1 = urlparse(url1)
    parsed2 = urlparse(url2)

    if len(parsed1.path) == 1 and parsed1.path == "/":
        path1 = ""
    else:
        path1 = parsed1.path

    if len(parsed2.path) == 1 and parsed2.path == "/":
        path2 = ""
    else:
        path2 = parsed2.path

    # Compare relevant components
    return (
            parsed1.scheme == parsed2.scheme and
            parsed1.netloc == parsed2.netloc and
            path1 == path2
    )