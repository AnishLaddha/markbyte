import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SignupFlowTest(unittest.TestCase):
    def setUp(self):
        # Ensure that Chromedriver is in your PATH and that the driver version
        # is compatible with your installed version of Chrome.
        self.driver = webdriver.Chrome()

    def test_user_signup(self):
        driver = self.driver
        # Update the URL if your frontend runs on a port different than 5173.
        driver.get("http://localhost:5173/auth?tab=signup")

        # Wait until the signup form loads.
        wait = WebDriverWait(driver, 10)
        username_field = wait.until(EC.presence_of_element_located((By.NAME, "username")))
        email_field = driver.find_element(By.NAME, "email")
        password_field = driver.find_element(By.NAME, "password")

        # Fill out the form.
        username_field.send_keys("seleniumuser")
        email_field.send_keys("seleniumuser@example.com")
        password_field.send_keys("securepassword")

        # Submit the form; assuming pressing RETURN submits.
        password_field.send_keys(Keys.RETURN)

        # Wait for redirection; assumes the URL contains "dashboard" post-signup.
        wait.until(EC.url_contains("dashboard"))
        current_url = driver.current_url
        self.assertIn("dashboard", current_url, "Signup did not redirect to the dashboard.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
