
import streamlit as st
import cv2
import numpy as np
import pandas as pd
from datetime import datetime
from io import BytesIO

st.set_page_config(
    page_title="Aqua Sense Pro AI",
    page_icon="🌊",
    layout="wide"
)

# ============================================================
# SESSION STATE
# ============================================================
if "total_uploads" not in st.session_state:
    st.session_state.total_uploads = 0

if "total_visitors" not in st.session_state:
    st.session_state.total_visitors = 0

# ============================================================
# CSS
# ============================================================
st.markdown("""
<style>
.main-title {
    text-align:center;
    font-size:42px;
    font-weight:800;
}
.subtitle {
    text-align:center;
    color:#666;
    font-size:18px;
    margin-bottom:25px;
}
.report-box {
    padding:20px;
    border-radius:15px;
    border:1px solid #d9e2ec;
    background:#fff;
    margin-bottom:18px;
}
.comment-box {
    padding:15px;
    border-radius:12px;
    background:#f1f5f9;
}
</style>
""", unsafe_allow_html=True)

# ============================================================
# HEADER
# ============================================================
st.markdown('<div class="main-title">🌊 Aqua Sense Pro AI</div>',
            unsafe_allow_html=True)
st.markdown(
    '<div class="subtitle">Intelligent Water Monitoring & Image-Based Water Quality Assessment</div>',
    unsafe_allow_html=True
)

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def percentage_level(value):
    if value <= 30:
        return "Low"
    elif value <= 60:
        return "Medium"
    return "High"

def detailed_score_level(value):
    if value <= 10:
        return "Low"
    elif value <= 20:
        return "Low-Mid"
    elif value <= 30:
        return "Low-High"
    elif value <= 40:
        return "Mid-Low"
    elif value <= 50:
        return "Mid-Mid"
    elif value <= 60:
        return "Mid-High"
    elif value <= 70:
        return "High-Low"
    elif value <= 80:
        return "High-Mid"
    elif value <= 95:
        return "High"
    return "High-High"

def get_clarity_comment(level):
    comments = {
        "Low": "Low Water Clarity means the water is cloudy or murky due to suspended particles, algae, or pollution. It can reduce water quality, harm aquatic life, and indicate possible contamination.",
        "Medium": "Medium Water Clarity indicates that the water contains some visible cloudiness or suspended material. Regular monitoring is recommended.",
        "High": "High Water Clarity indicates that the water appears relatively clear with fewer visible suspended particles."
    }
    return comments[level]

def get_turbidity_comment(level):
    comments = {
        "Low": "Low estimated turbidity indicates relatively clear-looking water with limited visible suspended particles.",
        "Medium": "Medium estimated turbidity indicates visible cloudiness or suspended material. Further water-quality testing is recommended.",
        "High": "High estimated turbidity indicates strongly cloudy or visually contaminated water. Additional investigation and appropriate treatment are recommended."
    }
    return comments[level]

def get_algae_comment(level):
    comments = {
        "Low": "Low algae/plankton probability. The image does not show strong green color dominance.",
        "Medium": "Medium algae/plankton probability. Green coloration is present and biological growth may be possible.",
        "High": "High algae/plankton probability. Strong green coloration may indicate algae or plankton. Image analysis cannot confirm the exact biological organism."
    }
    return comments[level]

def get_fish_comment(score):
    level = detailed_score_level(score)
    if score >= 70:
        return f"{level} Fish Farming Water: The water appears relatively suitable for fish farming based on visual characteristics. Regular monitoring of oxygen, pollutants and other water parameters is recommended."
    elif score >= 40:
        return f"{level} Fish Farming Water: The water may be acceptable for fish farming but needs regular monitoring. Improving oxygen levels and reducing pollutants can help maintain healthy fish growth."
    return f"{level} Fish Farming Water: The water shows significant visual-quality concerns. Full water-quality testing and appropriate treatment are recommended before use."

def get_drinking_comment(status, percentage):
    if percentage >= 70:
        return "The water appears visually cleaner based on the image. However, this percentage is only an AI-based visual estimation and does not confirm drinking-water safety."
    elif percentage >= 40:
        return "The water shows moderate visual-quality concerns. It should not be considered safe for drinking without proper laboratory testing."
    return "The water shows significant visual-quality concerns. It should not be consumed based on this visual assessment. Laboratory testing is strongly recommended."

def get_bacteria_comment(level, percentage):
    return f"Bacteria Risk is estimated at {percentage}%. Risk category: {level}. This is a visual-risk estimation based on image characteristics and cannot directly detect or measure bacteria."

def get_virus_comment(level, percentage):
    return f"Virus Risk is estimated at {percentage}%. Risk category: {level}. This is a visual-risk estimation and cannot directly detect viruses. Laboratory testing is required for actual virus detection."

# ============================================================
# ANALYSIS
# ============================================================
def analyze(image):
    image = cv2.resize(image, (500, 500))
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    brightness = float(np.mean(gray))
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    b, g, r = cv2.mean(image)[:3]

    total_rgb = r + g + b + 0.0001
    red_ratio = (r / total_rgb) * 100
    green_ratio = (g / total_rgb) * 100
    blue_ratio = (b / total_rgb) * 100

    if b > r and b > g:
        water_type = "River / Sea Water"
    elif g > r:
        water_type = "Pond Water (Algae Possible)"
    else:
        water_type = "Polluted / Dirty Water"

    clarity_percentage = int(np.clip((sharpness / 600) * 100, 1, 100))
    clarity_level = percentage_level(clarity_percentage)

    turbidity_percentage = int(
        np.clip(100 - ((brightness / 255) * 100), 1, 100)
    )
    turbidity_level = percentage_level(turbidity_percentage)

    green_difference = g - max(r, b)
    if green_difference > 0:
        algae_percentage = int(np.clip(
            50 + (green_difference / 255) * 100, 1, 100))
    else:
        algae_percentage = int(np.clip(
            20 + (green_difference / 255) * 100, 1, 100))

    algae_level = percentage_level(algae_percentage)

    fish_score = 100
    if turbidity_level == "High":
        fish_score -= 35
    elif turbidity_level == "Medium":
        fish_score -= 15

    if clarity_level == "Low":
        fish_score -= 25
    elif clarity_level == "Medium":
        fish_score -= 10

    if algae_level == "High":
        fish_score -= 20
    elif algae_level == "Medium":
        fish_score -= 10

    fish_score = int(np.clip(fish_score, 0, 100))
    fish_level = detailed_score_level(fish_score)

    drinking_percentage = int(np.clip(
        fish_score * 0.55
        + (100 - turbidity_percentage) * 0.25
        + clarity_percentage * 0.20,
        1, 100
    ))

    if drinking_percentage >= 70:
        drinking_status = "Maybe Safe (Needs Testing)"
    elif drinking_percentage >= 40:
        drinking_status = "Not Safe"
    else:
        drinking_status = "Dangerous"

    drinking_level = percentage_level(drinking_percentage)

    bacteria_risk = int(np.clip(
        turbidity_percentage * 0.50
        + algae_percentage * 0.20
        + (100 - clarity_percentage) * 0.30,
        1, 95
    ))
    bacteria_level = detailed_score_level(bacteria_risk)

    virus_risk = int(np.clip(bacteria_risk - 10, 10, 95))
    virus_level = detailed_score_level(virus_risk)

    overall_score = int(np.clip(
        fish_score * 0.40
        + clarity_percentage * 0.20
        + (100 - turbidity_percentage) * 0.20
        + (100 - algae_percentage) * 0.20,
        0, 100
    ))
    overall_level = detailed_score_level(overall_score)

    if overall_score >= 70:
        final_status = "Relatively Good Visual Quality"
    elif overall_score >= 40:
        final_status = "Moderate Visual Quality"
    else:
        final_status = "Poor Visual Quality"

    if fish_score >= 70:
        aqua_status = "Good for Fish Farming"
        aqua_advice = "Add/maintain aeration, monitor dissolved oxygen, control organic waste and perform regular water testing."
    elif fish_score >= 40:
        aqua_status = "Needs Improvement"
        aqua_advice = "Use appropriate water-quality management, reduce waste, improve water circulation and monitor dissolved oxygen."
    else:
        aqua_status = "Not Suitable"
        aqua_advice = "Full water-quality assessment and treatment are recommended before using the water for fish farming."

    return {
        "Water Type": water_type,
        "Clarity Level": clarity_level,
        "Clarity Score": clarity_percentage,
        "Clarity Comment": get_clarity_comment(clarity_level),
        "Turbidity Level": turbidity_level,
        "Turbidity Score": turbidity_percentage,
        "Turbidity Comment": get_turbidity_comment(turbidity_level),
        "Algae Level": algae_level,
        "Algae Score": algae_percentage,
        "Algae Comment": get_algae_comment(algae_level),
        "Plankton Probability": plankton_probability if "plankton_probability" in locals() else algae_percentage,
        "Fish Farming Level": fish_level,
        "Fish Farming Score": fish_score,
        "Fish Farming Comment": get_fish_comment(fish_score),
        "Drinking Water Level": drinking_level,
        "Drinking Water Score": drinking_percentage,
        "Drinking Water Status": drinking_status,
        "Drinking Water Comment": get_drinking_comment(drinking_status, drinking_percentage),
        "Bacteria Risk Level": bacteria_level,
        "Bacteria Risk": bacteria_risk,
        "Bacteria Risk Comment": get_bacteria_comment(bacteria_level, bacteria_risk),
        "Virus Risk Level": virus_level,
        "Virus Risk": virus_risk,
        "Virus Risk Comment": get_virus_comment(virus_level, virus_risk),
        "Aquaculture Status": aqua_status,
        "Aquaculture Advice": aqua_advice,
        "Overall Level": overall_level,
        "Overall Score": overall_score,
        "Final Status": final_status,
        "Brightness": round(brightness, 2),
        "Sharpness": round(sharpness, 2),
        "Red": round(r, 2),
        "Green": round(g, 2),
        "Blue": round(b, 2),
        "Red Ratio": round(red_ratio, 2),
        "Green Ratio": round(green_ratio, 2),
        "Blue Ratio": round(blue_ratio, 2)
    }

# ============================================================
# DATA TABLES
# ============================================================
def create_report_dataframe(results):
    rows = [
        ["Water Type", "-", results["Water Type"], "Visual water-type classification."],
        ["Clarity", results["Clarity Level"], f'{results["Clarity Score"]}%', results["Clarity Comment"]],
        ["Turbidity", results["Turbidity Level"], f'{results["Turbidity Score"]}%', results["Turbidity Comment"]],
        ["Algae Level", results["Algae Level"], f'{results["Algae Score"]}%', results["Algae Comment"]],
        ["Fish Farming Score", results["Fish Farming Level"], f'{results["Fish Farming Score"]}%', results["Fish Farming Comment"]],
        ["Drinking Water", results["Drinking Water Level"], f'{results["Drinking Water Score"]}%', results["Drinking Water Comment"]],
        ["Bacteria Risk", results["Bacteria Risk Level"], f'{results["Bacteria Risk"]}%', results["Bacteria Risk Comment"]],
        ["Virus Risk", results["Virus Risk Level"], f'{results["Virus Risk"]}%', results["Virus Risk Comment"]],
        ["Aquaculture Status", "-", results["Aquaculture Status"], results["Aquaculture Advice"]],
        ["Overall Result", results["Overall Level"], f'{results["Overall Score"]}%', results["Final Status"]]
    ]
    return pd.DataFrame(rows, columns=["Parameter", "Level", "Score / Result", "Comment"])

def create_statistics_dataframe():
    total_uploads = st.session_state.total_uploads
    total_visitors = max(1, st.session_state.total_visitors)
    avg = total_uploads / total_visitors

    return pd.DataFrame([
        ["Total Visitor", total_visitors],
        ["Total Image Upload", total_uploads],
        ["AVG Image Upload / Person", round(avg, 2)]
    ], columns=["Statistic", "Value"])

def create_cv_dataframe(results):
    return pd.DataFrame([
        ["Brightness", results["Brightness"]],
        ["Sharpness", results["Sharpness"]],
        ["Red Channel", results["Red"]],
        ["Green Channel", results["Green"]],
        ["Blue Channel", results["Blue"]],
        ["Red Ratio", f'{results["Red Ratio"]}%'],
        ["Green Ratio", f'{results["Green Ratio"]}%'],
        ["Blue Ratio", f'{results["Blue Ratio"]}%']
    ], columns=["Computer Vision Parameter", "Value"])

def dataframe_to_csv_bytes(df):
    return df.to_csv(index=False).encode("utf-8")

def dataframe_to_excel_bytes(report_df, stats_df, cv_df):
    output = BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        report_df.to_excel(writer, sheet_name="Water Report", index=False)
        stats_df.to_excel(writer, sheet_name="Statistics", index=False)
        cv_df.to_excel(writer, sheet_name="Computer Vision", index=False)
    output.seek(0)
    return output.getvalue()

# ============================================================
# UPLOAD
# ============================================================
uploaded_file = st.file_uploader(
    "📤 Upload Water Image",
    type=["jpg", "jpeg", "png"]
)

if uploaded_file is None:
    st.info("👆 Upload a water image to generate the complete Aqua Sense Pro AI report.")

else:
    st.session_state.total_uploads += 1
    st.session_state.total_visitors = max(
        st.session_state.total_visitors,
        1
    )

    file_bytes = np.asarray(
        bytearray(uploaded_file.read()),
        dtype=np.uint8
    )
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if image is None:
        st.error("Unable to read the uploaded image.")

    else:
        results = analyze(image)

        st.markdown("---")

        col1, col2 = st.columns([1.3, 1])

        with col1:
            st.subheader("🖼️ Uploaded Water Image")
            st.image(
                image,
                channels="BGR",
                use_container_width=True
            )

        with col2:
            st.subheader("🌍 Water Type")
            st.success(results["Water Type"])

            st.metric(
                "Overall Score",
                f'{results["Overall Score"]}%'
            )

            st.write(
                "Overall Level:",
                f'**{results["Overall Level"]}**'
            )

            st.write(
                "Final Status:",
                f'**{results["Final Status"]}**'
            )

        # ====================================================
        # COMPLETE OUTPUT TABLE
        # ====================================================
        st.markdown("---")
        st.header("📋 Aqua Sense Pro AI — Complete Output Data")

        report_df = create_report_dataframe(results)

        st.dataframe(
            report_df,
            use_container_width=True,
            hide_index=True
        )

        # ====================================================
        # DOWNLOAD BUTTONS — CSV
        # ====================================================
        st.subheader("📥 Download Output Data")

        csv_data = dataframe_to_csv_bytes(report_df)

        st.download_button(
            label="⬇️ Download Water Report CSV",
            data=csv_data,
            file_name="AquaSense_Water_Report.csv",
            mime="text/csv",
            use_container_width=True
        )

        # ====================================================
        # STATISTICS TABLE
        # ====================================================
        st.markdown("---")
        st.header("📊 System Statistics")

        stats_df = create_statistics_dataframe()

        st.dataframe(
            stats_df,
            use_container_width=True,
            hide_index=True
        )

        # ====================================================
        # COMPUTER VISION TABLE
        # ====================================================
        st.header("🔬 Computer Vision Data")

        cv_df = create_cv_dataframe(results)

        st.dataframe(
            cv_df,
            use_container_width=True,
            hide_index=True
        )

        # ====================================================
        # EXCEL DOWNLOAD
        # ====================================================
        excel_data = dataframe_to_excel_bytes(
            report_df,
            stats_df,
            cv_df
        )

        st.download_button(
            label="📊 Download Complete Excel File (.xlsx)",
            data=excel_data,
            file_name="AquaSense_Complete_Report.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True
        )

        # ====================================================
        # VISUAL REPORT
        # ====================================================
        st.markdown("---")
        st.header("📈 Visual Report")

        metric1, metric2, metric3 = st.columns(3)

        with metric1:
            st.metric(
                "Clarity",
                f'{results["Clarity Score"]}%',
                results["Clarity Level"]
            )

        with metric2:
            st.metric(
                "Turbidity",
                f'{results["Turbidity Score"]}%',
                results["Turbidity Level"]
            )

        with metric3:
            st.metric(
                "Algae",
                f'{results["Algae Score"]}%',
                results["Algae Level"]
            )

        st.subheader("🐟 Fish Farming Score")
        st.progress(results["Fish Farming Score"] / 100)
        st.write(
            f'**{results["Fish Farming Level"]} — '
            f'{results["Fish Farming Score"]}%**'
        )
        st.info(results["Fish Farming Comment"])

        st.subheader("💧 Drinking Water Analysis")
        st.progress(results["Drinking Water Score"] / 100)
        st.write(
            f'**{results["Drinking Water Level"]} — '
            f'{results["Drinking Water Score"]}%**'
        )
        st.write(
            "Status:",
            f'**{results["Drinking Water Status"]}**'
        )
        st.info(results["Drinking Water Comment"])

        st.subheader("🦠 Bacteria Risk")
        st.progress(results["Bacteria Risk"] / 100)
        st.write(
            f'**{results["Bacteria Risk Level"]} — '
            f'{results["Bacteria Risk"]}%**'
        )
        st.info(results["Bacteria Risk Comment"])

        st.subheader("🧬 Virus Risk")
        st.progress(results["Virus Risk"] / 100)
        st.write(
            f'**{results["Virus Risk Level"]} — '
            f'{results["Virus Risk"]}%**'
        )
        st.info(results["Virus Risk Comment"])

        st.subheader("🐟 Aquaculture Recommendation")
        st.success(results["Aquaculture Status"])
        st.warning(results["Aquaculture Advice"])

        # ====================================================
        # AQUA SENSE DESCRIPTION
        # ====================================================
        st.markdown("---")
        st.header("🌊 Aqua Sense AI")

        st.info(
            "Aqua Sense AI is an intelligent water monitoring system "
            "that uses artificial intelligence to analyze water quality "
            "in real time. It helps detect contamination early, improves "
            "water management, and supports safer, more sustainable use "
            "of water resources."
        )

        # ====================================================
        # MEMBERS
        # ====================================================
        st.header("👨‍💻 Project Member")

        m1, m2, m3 = st.columns(3)

        with m1:
            st.write("**Md. Imran Hossain**")
        with m2:
            st.write("**Md. Enamul Kobir**")
        with m3:
            st.write("**Md. Miraz & Akhi Mallik **")

        # ====================================================
        # DISCLAIMER
        # ====================================================
        st.markdown("---")
        st.warning(
            "⚠️ This is an image-based AI prototype. "
        )

        st.caption(
            "Report Generated: "
            + datetime.now().strftime("%d %B %Y, %I:%M %p")
        )
