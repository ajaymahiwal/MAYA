const Listing = require("../Models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require("../Models/user.js");
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let list = await Listing.find({});

    // console.log(list);
    res.render("./list/listing.ejs", { list });
}


module.exports.renderNewListingForm = async (req, res) => {
    res.render("./list/newItem.ejs");
}


module.exports.createListing = async (req, res, next) => {

    // let response = await geocodingClient.forwardGeocode({
    //     query: req.body.itemDetails.location,
    //     limit: 1,
    // }).send();


    console.log("req.body.itemDetails");
    console.log(req.body.itemDetails);
    const item = new Listing(req.body.itemDetails);
    item.owner = req.user._id;

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url);
        console.log(filename);
        item.image = { filename, url };
    }

    // item.geometry = response.body.features[0].geometry;


    let savedItem = await item.save();
    console.log(savedItem);
    req.flash("success", "New Listing Added !");
    res.redirect(`/listings/${item._id}/#main-card`);

}


module.exports.showOneListing = async (req, res) => {
    let { id } = req.params;
    let item = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "owner",
        },
    })
        .populate("owner");

    if (!item) {
        req.flash("error", "Listing You requested for does not exist !");
        res.redirect("/listings");
    }
    // console.log(item);
    res.render("./list/show.ejs", { item });
}


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let item = await Listing.findById(id);

    if (!item) {
        req.flash("error", "Listing You requested for does not exist !");
        res.redirect("/listings/#all-cards");
    }

    let OrgImgUrl = item.image.url;
    OrgImgUrl = OrgImgUrl.replace("/upload", "/upload/w_250");

    // console.log(item);
    res.render("./list/edit.ejs", { item, OrgImgUrl });
}


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    if (!req.body.itemDetails) {
        next(new ExpressError(400, "Send Valid Data In Listing."))
    }
    // let response = await geocodingClient.forwardGeocode({
    //     query: req.body.itemDetails.location,
    //     limit: 1,
    // }).send();
    // req.body.itemDetails.geometry = response.body.features[0].geometry;
    let updatedItem = await Listing.findByIdAndUpdate(id, { ...req.body.itemDetails }, { runValidators: true, new: true });


    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedItem.image = { filename, url };
        await updatedItem.save();
    }

    // console.log(updatedItem);
    req.flash("success", "Listing Updated !");

    res.redirect(`/listings/${id}/#main-card`);
}


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedItem = await Listing.findByIdAndDelete(id);
    // console.log(deletedItem);
    console.log("Listing Deleted");
    req.flash("success", "Listing Deleted !");
    res.redirect("/listings/#all-cards");
}

module.exports.followingsposts = async (req,res) => {
    let list = [];
    let followingsUser = [];
    // console.log(req.user.followings[0].valueOf());
    for(let i=0;i<req.user.followings.length;i++){
        let id = req.user.followings[i].valueOf();
        // let user = await User.findById(id).populate({populate: {
        //     path: "owner",
        // }});
        // console.log("id",id)
        if(id){
            let posts = await Listing.find({owner:id});
            // console.log("pstsposts)
            list = [...list,...posts];
        }
    }


    // console.log(list);
    res.render("./list/followingspost.ejs", { list });
}