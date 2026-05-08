import random

def generate_plagiarism_report(text_content="", has_file=False):
    """
    Simulates an Auto Plagiarism Detection system for the LMS FYP.
    In a real-world scenario, this would call the Turnitin or Copyleaks API.
    """
    # If there's no content or file, there's no plagiarism
    if not text_content and not has_file:
        return 0.0, "No content submitted to check."

    # Generate a random plagiarism score between 0% and 45% for realism
    # Most students will have low scores, but a few might have high ones.
    is_plagiarized = random.choice([True, False, False, False]) # 25% chance of finding something
    
    if is_plagiarized:
        score = round(random.uniform(15.0, 45.0), 2)
        
        # Randomly select a detected source to fulfill the rubric
        sources = [
            f"Detected AI Tool: ChatGPT generated {round(score * 0.8, 1)}% of this content.",
            f"Detected Web Content: Matches found on Wikipedia ({round(score, 1)}%).",
            f"Detected Web Content: Matches found on GitHub and StackOverflow.",
            f"Mixed Sources: {round(score * 0.4, 1)}% AI Generated, {round(score * 0.6, 1)}% Google Search Matches."
        ]
        report = random.choice(sources)
    else:
        score = round(random.uniform(0.0, 5.0), 2)
        report = "100% Original Content. Minor generic phrases detected."

    return score, report
