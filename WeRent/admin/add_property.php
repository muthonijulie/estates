<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include "../config.php"; // Your MySQLi connection ($conn)

// Check if form submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // Collect and sanitize input data
    $title = $conn->real_escape_string(trim($_POST['title']));
    $property_type = $conn->real_escape_string(trim($_POST['property_type']));
    $location = $conn->real_escape_string(trim($_POST['location']));
    $price = floatval($_POST['price']);
    $bedrooms = intval($_POST['bedrooms']);
    $bathrooms = intval($_POST['bathrooms']);
    $description = $conn->real_escape_string(trim($_POST['description']));
    $listing_type = $conn->real_escape_string(trim($_POST['listing_type']));
    $amenities = $conn->real_escape_string(trim($_POST['amenities']));

    // Handle main image upload
    $image_path = null;
    if (isset($_FILES['image_url']) && $_FILES['image_url']['error'] == 0) {
        $target_dir = "../uploads/"; // Adjust path as needed
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }

        $image_name = basename($_FILES["image_url"]["name"]);
        $image_ext = strtolower(pathinfo($image_name, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif'];

        if (in_array($image_ext, $allowed)) {
            $new_image_name = uniqid('prop_') . '.' . $image_ext;
            $target_file = $target_dir . $new_image_name;

            if (move_uploaded_file($_FILES["image_url"]["tmp_name"], $target_file)) {
                // Store relative path for DB (adjust as per your project)
                $image_path = "uploads/" . $new_image_name;
            } else {
                die("Failed to upload main image.");
            }
        } else {
            die("Invalid image file type for main image.");
        }
    } else {
        $image_path = null; // or set default image path if needed
    }

    // Handle gallery images upload (optional multiple)
    $gallery_paths = [];
    if (isset($_FILES['gallery_images']) && !empty($_FILES['gallery_images']['name'][0])) {
        $gallery_files = $_FILES['gallery_images'];
        $gallery_count = count($gallery_files['name']);

        for ($i = 0; $i < $gallery_count; $i++) {
            if ($gallery_files['error'][$i] === 0) {
                $file_name = basename($gallery_files['name'][$i]);
                $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

                if (in_array($file_ext, $allowed)) {
                    $new_name = uniqid('gallery_') . '.' . $file_ext;
                    $target_file = $target_dir . $new_name;

                    if (move_uploaded_file($gallery_files['tmp_name'][$i], $target_file)) {
                        $gallery_paths[] = "uploads/" . $new_name;
                    } else {
                        // You may choose to log this error instead of die
                        die("Failed to upload gallery image: " . htmlspecialchars($file_name));
                    }
                } else {
                    die("Invalid image file type in gallery: " . htmlspecialchars($file_name));
                }
            }
        }
    }

    // Convert gallery array to JSON string (or serialize)
    $gallery_json = !empty($gallery_paths) ? json_encode($gallery_paths) : null;

    // Prepare SQL statement with placeholders
    $sql = "INSERT INTO properties (title, property_type, location, price, bedrooms, bathrooms, image_url, description, listing_type, gallery, amenities)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    // Bind parameters:
    // s = string, d = double (float), i = integer
    $stmt->bind_param(
        "sssdiisssss",
        $title,
        $property_type,
        $location,
        $price,
        $bedrooms,
        $bathrooms,
        $image_path,
        $description,
        $listing_type,
        $gallery_json,
        $amenities
    );

    // Execute and check
    if ($stmt->execute()) {
        echo "Property added successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();

} else {
    echo "Invalid request.";
}
?>
