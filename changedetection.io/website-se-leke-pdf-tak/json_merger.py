import json
from typing import Dict, List

class JSONMerger:
    """
    A class to merge two structured JSON files. It updates existing sections
    and adds new ones based on a unique section 'id'.
    """

    def merge(self, base_file_path: str, new_file_path: str, output_file_path: str):
        """
        Merges a 'new' JSON file into a 'base' JSON file.

        Args:
            base_file_path (str): Path to the master JSON file.
            new_file_path (str): Path to the JSON file with new/updated content.
            output_file_path (str): Path to save the merged JSON file.
        """
        print(f"Loading base file: {base_file_path}")
        with open(base_file_path, 'r', encoding='utf-8') as f:
            base_data = json.load(f)

        print(f"Loading new data file: {new_file_path}")
        with open(new_file_path, 'r', encoding='utf-8') as f:
            new_data = json.load(f)

        # Create a dictionary of existing sections for quick lookup
        base_sections_dict: Dict[str, Dict] = {
            section['id']: section for section in base_data.get('sections', [])
        }

        # Iterate through the new sections and update/add them to the base data
        new_sections_count = 0
        updated_sections_count = 0

        for new_section in new_data.get('sections', []):
            section_id = new_section.get('id')
            if not section_id:
                continue  # Skip sections without an ID

            if section_id in base_sections_dict:
                # Update existing section
                base_sections_dict[section_id].update(new_section)
                updated_sections_count += 1
            else:
                # Add new section
                base_sections_dict[section_id] = new_section
                new_sections_count += 1
        
        # Update the title if the new data has one
        if new_data.get("title"):
            base_data["title"] = new_data["title"]

        # Convert the dictionary back to a list of sections
        base_data['sections'] = list(base_sections_dict.values())

        # Save the merged data
        print(f"Saving merged file to: {output_file_path}")
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(base_data, f, indent=2)

        print(f"Merge complete. Added: {new_sections_count} new sections, Updated: {updated_sections_count} sections.")

# Example usage:
if __name__ == '__main__':
    # Create dummy files for testing
    base_json = {
        "title": "Original Document",
        "sections": [
            {"id": "1", "title": "Introduction", "text": "This is the original intro.", "level": 1},
            {"id": "2", "title": "Chapter 1", "text": "Original content for chapter 1.", "level": 1}
        ]
    }
    new_json = {
        "title": "Updated Document",
        "sections": [
            {"id": "2", "title": "Chapter 1 (Updated)", "text": "This is the updated content for chapter 1.", "level": 1},
            {"id": "3", "title": "Chapter 2", "text": "This is a brand new chapter.", "level": 1}
        ]
    }

    with open("base.json", "w") as f:
        json.dump(base_json, f, indent=2)
    
    with open("new.json", "w") as f:
        json.dump(new_json, f, indent=2)

    merger = JSONMerger()
    merger.merge("base.json", "new.json", "merged.json")

    with open("merged.json", "r") as f:
        print("\n--- Merged Content ---")
        print(f.read())
