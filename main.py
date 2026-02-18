from flask import Flask, request, jsonify
from flask_cors import CORS
from sites.kleinanzeigen import get_kleinanzeigen_results

app = Flask(__name__)
CORS(app)

@app.route("/search", methods=["POST"])
def search():
    data = request.json
    query = data.get("query", "")
    location = data.get("location", "")
    radius = data.get("radius", 50)
    category = data.get("category", None)
    category_id = data.get("category_id", None)
    if not query and not category_id:
        return jsonify([])

    results = get_kleinanzeigen_results(
        query, location=location, radius=radius,
        category=category, category_id=category_id
    )
    return jsonify(sorted(results, key=lambda x: x["price"]))

if __name__ == "__main__":
    app.run(debug=True)
